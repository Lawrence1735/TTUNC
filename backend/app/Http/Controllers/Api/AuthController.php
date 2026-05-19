<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

final class AuthController extends Controller
{
    /**
     * Authenticate a user and issue a Sanctum API token.
     *
     * Returns the token alongside the user resource so the frontend can
     * immediately populate the auth context without a second round-trip.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Revoke all previous tokens for this user (single-session policy)
        $user->tokens()->delete();

        // Abilities are scoped to the user's role
        $abilities = $this->abilitiesForRole($user->role);

        $token = $user->createToken(
            name: "api-token-{$user->id}",
            abilities: $abilities,
        )->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ], Response::HTTP_OK);
    }

    /**
     * Revoke the current token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.'], Response::HTTP_OK);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }

    /**
     * Maps roles to Sanctum token abilities.
     *
     * @return string[]
     */
    private function abilitiesForRole(string $role): array
    {
        return match ($role) {
            'admin'    => ['*'],
            'director' => [
                'dashboard:read',
                'applications:read',
                'applications:write',
                'interviews:read',
                'interviews:write',
                'trainees:read',
                'trainees:write',
                'attendance:read',
                'attendance:write',
                'evaluations:read',
                'evaluations:write',
            ],
            'trainee', 'student' => [
                'dashboard:read',
                'attendance:read',
                'evaluations:read',
            ],
            'scholar' => [
                'dashboard:read',
                'evaluations:read',
            ],
            default => ['dashboard:read'],
        };
    }
}
