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
}