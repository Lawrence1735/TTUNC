<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardSummaryController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\TrainingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — TalentTrackUNC
|--------------------------------------------------------------------------
|
| All routes are versioned under /api/v1.
|
| Auth routes are public (no Sanctum guard).
| The "public" group allows unauthenticated application submissions.
| All other routes require a valid Sanctum token.
|
| Role-based access is enforced via the role middleware defined in
| bootstrap/app.php and checked inside each controller where fine-grained
| ability checks are needed.
|
*/

// ── Authentication (public) ───────────────────────────────────────────────────
Route::prefix('v1/auth')->name('auth.')->group(function (): void {
    Route::post('/login',  [AuthController::class, 'login'])->name('login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/me',      [AuthController::class, 'me'])->name('me');
    });
});

// ── Public endpoints (no auth required) ──────────────────────────────────────
Route::prefix('v1')->name('public.')->group(function (): void {
    // Public scholarship application submission
    Route::post(
        '/applications',
        [RecruitmentController::class, 'store']
    )->name('applications.store');
});

// ── Protected endpoints (Sanctum token required) ──────────────────────────────
Route::prefix('v1')
    ->middleware('auth:sanctum')
    ->group(function (): void {

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

        // ── Training ──────────────────────────────────────────────────────────
        Route::prefix('training')->name('training.')->group(function (): void {

            // Trainee roster
            Route::get(
                '/trainees',
                [TrainingController::class, 'indexTrainees']
            )->name('trainees.index')
             ->middleware('role:director,admin');

            Route::get(
                '/trainees/{trainee}',
                [TrainingController::class, 'showTrainee']
            )->name('trainees.show')
             ->middleware('role:director,admin,trainee');

            // Update trainee profile (director/admin only)
            Route::patch(
                '/trainees/{trainee}',
                [TrainingController::class, 'updateTrainee']
            )->name('trainees.update')
             ->middleware('role:director,admin');

            // Soft-delete trainee (director/admin only)
            Route::delete(
                '/trainees/{trainee}',
                [TrainingController::class, 'destroyTrainee']
            )->name('trainees.destroy')
             ->middleware('role:director,admin');

            // Per-trainee historical stats
            Route::get(
                '/trainees/{trainee}/stats',
                [TrainingController::class, 'traineeStats']
            )->name('trainees.stats')
             ->middleware('role:director,admin,trainee');

            // Attendance
            Route::get(
                '/attendance',
                [TrainingController::class, 'indexAttendance']
            )->name('attendance.index')
             ->middleware('role:director,admin');

            Route::post(
                '/attendance/batch',
                [TrainingController::class, 'batchUpsertAttendance']
            )->name('attendance.batch')
             ->middleware('role:director,admin');

            Route::patch(
                '/attendance/{record}/toggle-no-practice',
                [TrainingController::class, 'toggleNoPractice']
            )->name('attendance.toggle-no-practice')
             ->middleware('role:director,admin');

            // Evaluations
            Route::get(
                '/evaluations',
                [TrainingController::class, 'indexEvaluations']
            )->name('evaluations.index')
             ->middleware('role:director,admin');

            Route::post(
                '/evaluations',
                [TrainingController::class, 'storeEvaluation']
            )->name('evaluations.store')
             ->middleware('role:director,admin');

            Route::get(
                '/evaluations/{evaluation}',
                [TrainingController::class, 'showEvaluation']
            )->name('evaluations.show')
             ->middleware('role:director,admin,trainee');

            Route::patch(
                '/evaluations/{evaluation}',
                [TrainingController::class, 'updateEvaluation']
            )->name('evaluations.update')
             ->middleware('role:director,admin');
        });
    });
