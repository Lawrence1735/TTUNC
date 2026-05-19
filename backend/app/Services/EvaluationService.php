<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Evaluation;
use App\Repositories\AttendanceRepository;
use App\Repositories\EvaluationRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Business logic for Evaluation CRUD.
 *
 * Key rule: submitted evaluations are immutable.
 * Draft evaluations can be updated freely.
 */
final class EvaluationService
{
    public function __construct(
        private readonly EvaluationRepository $evaluationRepository,
        private readonly AttendanceRepository  $attendanceRepository,
    ) {}

    public function list(
        ?string $talentGroup,
        ?int $traineeId,
        ?string $status
    ): LengthAwarePaginator {
        return $this->evaluationRepository->paginate($talentGroup, $traineeId, $status);
    }

    public function get(int $id): Evaluation
    {
        return $this->evaluationRepository->findWithRelations($id);
    }

    /**
     * Create a new evaluation. The evaluator_id is always injected here,
     * never trusted from the request payload.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data, int $evaluatorId): Evaluation
    {
        return DB::transaction(function () use ($data, $evaluatorId): Evaluation {
            $evaluation = $this->evaluationRepository->create([
                ...$data,
                'evaluator_id' => $evaluatorId,
            ]);

            $evaluation->load(['trainee.user:id,name', 'evaluator:id,name']);

            return $evaluation;
        });
    }

    /**
     * Update a draft evaluation.
     *
     * @param array<string, mixed> $data
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function update(Evaluation $evaluation, array $data): Evaluation
    {
        if ($evaluation->status === 'submitted') {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Submitted evaluations cannot be modified.');
        }

        return DB::transaction(
            fn (): Evaluation => $this->evaluationRepository->update($evaluation, $data)
        );
    }

    /**
     * Build the full stats payload for a trainee's performance history.
     *
     * @return array<string, mixed>
     */
    public function traineeStatsPayload(int $traineeId): array
    {
        return [
            'monthly_attendance' => $this->attendanceRepository->monthlyAggregation($traineeId),
            'evaluation_trend'   => $this->evaluationRepository->trendForTrainee($traineeId),
            'latest_rating'      => $this->evaluationRepository->trendForTrainee($traineeId)->last()?->rating,
        ];
    }
}
