<?php

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
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Dashboard
        Route::get('/dashboard/summary', DashboardSummaryController::class);

        // Recruitment
        Route::prefix('recruitment')->group(function (): void {
            Route::get('/applications', [RecruitmentController::class, 'index']);
            Route::get('/applications/{application}', [RecruitmentController::class, 'show']);
            Route::post('/applications/{application}/schedule-interview', [RecruitmentController::class, 'scheduleInterview']);
            Route::post('/applications/{application}/approve', [RecruitmentController::class, 'handleApproveInterview']);
            Route::post('/applications/{application}/reject', [RecruitmentController::class, 'handleRejectInterview']);
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
