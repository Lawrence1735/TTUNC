<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

final class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], Response::HTTP_UNAUTHORIZED);
        }

        $user->tokens()->delete();

        $token = $user->createToken("api-token-{$user->id}")->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'talent_group' => $user->talent_group,
                'student_id'   => $user->student_id,
                'phone'        => $user->phone,
                'is_active'    => true,
                'created_at'   => $user->created_at,
            ],
        ], Response::HTTP_OK);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.'], Response::HTTP_OK);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'role'         => $user->role,
            'talent_group' => $user->talent_group,
            'student_id'   => $user->student_id,
            'phone'        => $user->phone,
            'is_active'    => true,
            'created_at'   => $user->created_at,
        ]);
    }
<<<<<<< HEAD

    /**
     * Refresh the authentication token.
     * Issues a new token with the same abilities as the current token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();

        if (!$currentToken) {
            return response()->json([
                'message' => 'No active token found.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Create new token with same abilities as current token
        $abilities = $currentToken->abilities;

        // Revoke old token
        $currentToken->delete();

        // Issue new token
        $newToken = $user->createToken(
            name: "api-token-{$user->id}-refreshed",
            abilities: $abilities,
        )->plainTextToken;

        return response()->json([
            'token' => $newToken,
            'user'  => new UserResource($user),
        ], Response::HTTP_OK);
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
=======
}
>>>>>>> origin/main
