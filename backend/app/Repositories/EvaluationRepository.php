<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Evaluation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * All Eloquent query logic for Evaluation.
 */
final class EvaluationRepository
{
    /**
     * Paginated evaluations scoped to a talent group.
     */
    public function paginate(
        ?string $talentGroup,
        ?int $traineeId,
        ?string $status,
        int $perPage = 30
    ): LengthAwarePaginator {
        return Evaluation::query()
            ->with([
                'trainee.user:id,name,student_id,talent_group',
                'evaluator:id,name',
            ])
            ->whereHas('trainee.user', fn ($q) => $q->when(
                $talentGroup,
                fn ($q2) => $q2->where('talent_group', $talentGroup)
            ))
            ->when($traineeId, fn ($q) => $q->where('trainee_id', $traineeId))
            ->when($status,    fn ($q) => $q->where('status', $status))
            ->orderByDesc('evaluation_date')
            ->paginate($perPage);
    }

    /**
     * Find a single evaluation with relations.
     */
    public function findWithRelations(int $id): Evaluation
    {
        return Evaluation::with(['trainee.user', 'evaluator:id,name'])->findOrFail($id);
    }

    /**
     * Create a new evaluation.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): Evaluation
    {
        return Evaluation::create($data);
    }

    /**
     * Update an existing evaluation.
     *
     * @param array<string, mixed> $data
     */
    public function update(Evaluation $evaluation, array $data): Evaluation
    {
        $evaluation->update($data);

        return $evaluation->fresh();
    }

    /**
     * Submitted evaluation score trend for a trainee.
     *
     * @return Collection<int, Evaluation>
     */
    public function trendForTrainee(int $traineeId): Collection
    {
        return Evaluation::query()
            ->where('trainee_id', $traineeId)
            ->where('status', 'submitted')
            ->select(['id', 'rating', 'evaluation_date', 'adjectival_rating', 'recommendation'])
            ->orderBy('evaluation_date')
            ->get();
    }
}
