<?php

<<<<<<< HEAD
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;

Route::apiResource('products', ProductController::class);
Route::get('users/{user}/products', [ProductController::class, 'productsByUser']);
Route::patch('products/{product}/assign', [ProductController::class, 'assign']);<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardSummaryController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\TrainingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    // ── Public routes ─────────────────────────────────────────────────────────────
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public application submission (no auth required)
    Route::post('/applications', [RecruitmentController::class, 'store']);

    // ── Authenticated routes ───────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function (): void {
        // Auth
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
        Route::get('/me', [AuthController::class, 'me'])->name('me');

        // ── Dashboard ─────────────────────────────────────────────────────────
        Route::get(
            '/dashboard/summary',
            DashboardSummaryController::class
        )->name('dashboard.summary')
         ->middleware('role:director,admin');

        // ── Recruitment ───────────────────────────────────────────────────────
        Route::prefix('recruitment')->name('recruitment.')->group(function (): void {

            // Application listing (director/admin only)
            Route::get(
                '/applications',
                [RecruitmentController::class, 'index']
            )->name('applications.index')
             ->middleware('role:director,admin');

            // Interview listing (director/admin only)
            Route::get(
                '/interviews',
                [RecruitmentController::class, 'indexInterviews']
            )->name('interviews.index')
             ->middleware('role:director,admin');

            // Single application detail
            Route::get(
                '/applications/{application}',
                [RecruitmentController::class, 'show']
            )->name('applications.show')
             ->middleware('role:director,admin');

            // Pipeline state transitions (director/admin only)
            Route::post(
                '/applications/{application}/schedule-interview',
                [RecruitmentController::class, 'scheduleInterview']
            )->name('applications.schedule-interview')
             ->middleware('role:director,admin');

            Route::post(
                '/applications/{application}/reschedule-interview',
                [RecruitmentController::class, 'rescheduleInterview']
            )->name('applications.reschedule-interview')
             ->middleware('role:director,admin');

            Route::post(
                '/applications/{application}/approve',
                [RecruitmentController::class, 'handleApproveInterview']
            )->name('applications.approve')
             ->middleware('role:director,admin');

            Route::post(
                '/applications/{application}/reject',
                [RecruitmentController::class, 'handleRejectInterview']
            )->name('applications.reject')
             ->middleware('role:director,admin');
        });

        // Training — Trainees
        Route::prefix('training')->group(function (): void {
            Route::get('/trainees', [TrainingController::class, 'indexTrainees']);
            Route::get('/trainees/{trainee}', [TrainingController::class, 'showTrainee']);
            Route::patch('/trainees/{trainee}', [TrainingController::class, 'updateTrainee']);
            Route::delete('/trainees/{trainee}', [TrainingController::class, 'destroyTrainee']);
            Route::get('/trainees/{trainee}/stats', [TrainingController::class, 'traineeStats']);

            // Attendance
            Route::get('/attendance', [TrainingController::class, 'indexAttendance']);
            Route::post('/attendance/batch', [TrainingController::class, 'batchUpsertAttendance']);
            Route::patch('/attendance/{record}/toggle-no-practice', [TrainingController::class, 'toggleNoPractice']);

            // Evaluations
            Route::get('/evaluations', [TrainingController::class, 'indexEvaluations']);
            Route::post('/evaluations', [TrainingController::class, 'storeEvaluation']);
            Route::get('/evaluations/{evaluation}', [TrainingController::class, 'showEvaluation']);
            Route::patch('/evaluations/{evaluation}', [TrainingController::class, 'updateEvaluation']);
        });
    });

});
=======
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

>>>>>>> origin/feature/operations-user-profile
