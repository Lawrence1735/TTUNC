<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardSummaryController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RecruitmentController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\TrainingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    // ── Public routes ─────────────────────────────────────────────────────────────
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

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

        // ── Training ──────────────────────────────────────────────────────────
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

        // ── Scholarship ───────────────────────────────────────────────────────
        Route::prefix('scholarship')->group(function (): void {
            Route::get('/benefits', [ScholarshipController::class, 'benefits']);
            Route::get('/renewals', [ScholarshipController::class, 'indexRenewals']);
            Route::post('/renewals', [ScholarshipController::class, 'submitRenewal']);
        });

        // ── Engagements ───────────────────────────────────────────────────────
        Route::prefix('engagements')->group(function (): void {
            Route::get('/', [EngagementController::class, 'index']);
            Route::get('/rehearsals', [EngagementController::class, 'rehearsals']);
            Route::post('/', [EngagementController::class, 'store'])
                ->middleware('role:director,admin');
        });

        // ── Documents ─────────────────────────────────────────────────────────
        Route::prefix('documents')->group(function (): void {
            Route::get('/', [DocumentController::class, 'index']);
            Route::get('/{document}', [DocumentController::class, 'show']);
            Route::post('/', [DocumentController::class, 'store'])
                ->middleware('role:director,admin');
        });

        // ── Notifications ─────────────────────────────────────────────────────
        Route::prefix('notifications')->group(function (): void {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/read-all', [NotificationController::class, 'markAllRead']);
            Route::post('/{id}/read', [NotificationController::class, 'markRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });

        // ── Products / Inventory ──────────────────────────────────────────────
        Route::prefix('products')->group(function (): void {
            Route::get('/', [ProductController::class, 'index']);
            Route::get('/{product}', [ProductController::class, 'show']);
            Route::post('/', [ProductController::class, 'store'])
                ->middleware('role:director,admin');
            Route::patch('/{product}', [ProductController::class, 'update'])
                ->middleware('role:director,admin');
            Route::delete('/{product}', [ProductController::class, 'destroy'])
                ->middleware('role:director,admin');
        });

        // ── Users (listing) ───────────────────────────────────────────────────
        Route::get('/users', [AuthController::class, 'index'])
            ->middleware('role:director,admin');
    });

});
