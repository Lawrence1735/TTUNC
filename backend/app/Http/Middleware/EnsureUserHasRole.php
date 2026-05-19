<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role-based access middleware.
 *
 * Usage in routes:
 *   ->middleware('role:director,admin')
 *
 * Accepts a comma-separated list of allowed roles. The authenticated user's
 * role must match at least one of the listed roles.
 */
final class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        // Admin role bypasses all role checks
        if ($user->role === 'admin') {
            return $next($request);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json(
                ['message' => 'You do not have permission to access this resource.'],
                Response::HTTP_FORBIDDEN
            );
        }

        return $next($request);
    }
}
