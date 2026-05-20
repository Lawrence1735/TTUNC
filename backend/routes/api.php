<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Models\User;

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    // Laravel will check the hashed password in the users table.
    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    return response()->json([
        'success' => false,
        'error' => 'Invalid email or password',
    ], 401);
});

