<?php

declare(strict_types=1);

use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register the role middleware alias
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);

        // Ensure all API responses are JSON
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render all exceptions as JSON for API consumers
        $exceptions->render(function (\Throwable $e, Request $request): ?Response {
            if ($request->is('api/*') || $request->expectsJson()) {
                $status = match (true) {
                    $e instanceof \Illuminate\Auth\AuthenticationException          => Response::HTTP_UNAUTHORIZED,
                    $e instanceof \Illuminate\Auth\Access\AuthorizationException    => Response::HTTP_FORBIDDEN,
                    $e instanceof \Illuminate\Validation\ValidationException        => Response::HTTP_UNPROCESSABLE_ENTITY,
                    $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => Response::HTTP_NOT_FOUND,
                    $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException => $e->getStatusCode(),
                    default => Response::HTTP_INTERNAL_SERVER_ERROR,
                };

                $body = ['message' => $e->getMessage()];

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    $body['errors'] = $e->errors();
                }

                return response()->json($body, $status);
            }

            return null;
        });
    })
    ->create();
