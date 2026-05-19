<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Training\BatchAttendanceRequest;
use App\Http\Requests\Training\StoreEvaluationRequest;
use App\Http\Requests\Training\UpdateTraineeRequest;
use App\Http\Resources\AttendanceRecordResource;
use App\Http\Resources\EvaluationResource;
use App\Http\Resources\TraineeResource;
use App\Models\AttendanceRecord;
use App\Models\Evaluation;
use App\Models\Trainee;
use App\Services\AttendanceService;
use App\Services\EvaluationService;
use App\Services\TraineeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

/**
 * Thin HTTP adapter for training-related endpoints.
 *
 * Responsibilities:
 *  - Parse and validate HTTP input (via FormRequests)
 *  - Call the appropriate Service method
 *  - Shape the HTTP response via API Resources
 *
 * No business logic, no DB queries, no transactions here.
 */
final class TrainingController extends Controller
{
    public function __construct(
        private readonly TraineeService    $traineeService,
        private readonly AttendanceService $attendanceService,
        private readonly EvaluationService $evaluationService,
    ) {}

    // ─── Trainees ─────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/training/trainees
     */
    public function indexTrainees(Request $request): AnonymousResourceCollection
    {
        $trainees = $this->traineeService->list(
            talentGroup: $request->user()->talent_group,
            search:      $request->string('search')->value() ?: null,
            status:      $request->string('status')->value() ?: null,
        );

        return TraineeResource::collection($trainees);
    }

    /**
     * GET /api/v1/training/trainees/{trainee}
     */
    public function showTrainee(Trainee $trainee): JsonResponse
    {
        $trainee = $this->traineeService->getWithRelations($trainee->id);

        return response()->json(['data' => new TraineeResource($trainee)]);
    }

    /**
     * PATCH /api/v1/training/trainees/{trainee}
     */
    public function updateTrainee(UpdateTraineeRequest $request, Trainee $trainee): JsonResponse
    {
        $updated = $this->traineeService->update($trainee, $request->validated());

        return response()->json(['data' => new TraineeResource($updated)]);
    }

    /**
     * DELETE /api/v1/training/trainees/{trainee}
     */
    public function destroyTrainee(Trainee $trainee): JsonResponse
    {
        $this->traineeService->delete($trainee);

        return response()->json(['message' => 'Trainee record deleted.'], Response::HTTP_OK);
    }

    /**
     * GET /api/v1/training/trainees/{trainee}/stats
     */
    public function traineeStats(Trainee $trainee): JsonResponse
    {
        $base  = $this->traineeService->stats($trainee);
        $extra = $this->evaluationService->traineeStatsPayload($trainee->id);

        return response()->json([
            'data' => [
                'trainee'            => new TraineeResource($base['trainee']),
                'completion_rate'    => $base['completion_rate'],
                'attendance_rate'    => $base['attendance_rate'],
                'monthly_attendance' => $extra['monthly_attendance'],
                'evaluation_trend'   => $extra['evaluation_trend'],
                'latest_rating'      => $extra['latest_rating'],
            ],
        ]);
    }

    // ─── Attendance ───────────────────────────────────────────────────────────

    /**
     * GET /api/v1/training/attendance
     */
    public function indexAttendance(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $records = $this->attendanceService->getMatrix(
            talentGroup: $request->user()->talent_group,
            dateFrom:    $request->string('date_from')->value() ?: null,
            dateTo:      $request->string('date_to')->value() ?: null,
        );

        return response()->json(['data' => AttendanceRecordResource::collection($records)]);
    }

    /**
     * POST /api/v1/training/attendance/batch
     */
    public function batchUpsertAttendance(BatchAttendanceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->attendanceService->batchUpsert(
            sessionDate: $validated['session_date'],
            noPractice:  (bool) $validated['no_practice'],
            records:     $validated['records'],
        );

        return response()->json([
            'message'       => 'Attendance recorded successfully.',
            'session_date'  => $validated['session_date'],
            'no_practice'   => (bool) $validated['no_practice'],
            'records_count' => count($validated['records']),
        ]);
    }

    /**
     * PATCH /api/v1/training/attendance/{record}/toggle-no-practice
     */
    public function toggleNoPractice(AttendanceRecord $record): JsonResponse
    {
        $updated = $this->attendanceService->toggleNoPractice($record);

        return response()->json([
            'message'     => 'No-practice flag toggled.',
            'no_practice' => $updated->no_practice,
        ]);
    }

    // ─── Evaluations ──────────────────────────────────────────────────────────

    /**
     * GET /api/v1/training/evaluations
     */
    public function indexEvaluations(Request $request): AnonymousResourceCollection
    {
        $evaluations = $this->evaluationService->list(
            talentGroup: $request->user()->talent_group,
            traineeId:   $request->integer('trainee_id') ?: null,
            status:      $request->string('status')->value() ?: null,
        );

        return EvaluationResource::collection($evaluations);
    }

    /**
     * POST /api/v1/training/evaluations
     */
    public function storeEvaluation(StoreEvaluationRequest $request): JsonResponse
    {
        $evaluation = $this->evaluationService->create(
            data:        $request->validated(),
            evaluatorId: $request->user()->id,
        );

        return response()->json(
            ['data' => new EvaluationResource($evaluation)],
            Response::HTTP_CREATED
        );
    }

    /**
     * GET /api/v1/training/evaluations/{evaluation}
     */
    public function showEvaluation(Evaluation $evaluation): JsonResponse
    {
        $evaluation = $this->evaluationService->get($evaluation->id);

        return response()->json(['data' => new EvaluationResource($evaluation)]);
    }

    /**
     * PATCH /api/v1/training/evaluations/{evaluation}
     */
    public function updateEvaluation(StoreEvaluationRequest $request, Evaluation $evaluation): JsonResponse
    {
        $updated = $this->evaluationService->update($evaluation, $request->validated());

        return response()->json(['data' => new EvaluationResource($updated)]);
    }
}
