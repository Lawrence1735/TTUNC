<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Trainee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * All Eloquent query logic for the Trainee model lives here.
 *
 * Controllers and Services never call Trainee::query() directly —
 * they go through this repository. This makes queries testable in
 * isolation and keeps controllers/services free of DB concerns.
 */
final class TraineeRepository
{
    /**
     * Paginated list of trainees, optionally scoped to a talent group
     * and filtered by name search or status.
     */
    public function paginate(
        ?string $talentGroup,
        ?string $search,
        ?string $status,
        int $perPage = 50
    ): LengthAwarePaginator {
        return Trainee::query()
            ->with(['user:id,name,email,student_id,talent_group,phone,year_level,course'])
            ->whereHas('user', function ($q) use ($talentGroup, $search): void {
                $q->when($talentGroup, fn ($q2) => $q2->where('talent_group', $talentGroup));
                $q->when($search, fn ($q2) => $q2->where('name', 'like', '%' . $search . '%'));
            })
            ->when($status, fn ($q) => $q->where('current_status', $status))
            ->orderBy('id')
            ->paginate($perPage);
    }

    /**
     * Find a trainee by primary key with full relations loaded.
     */
    public function findWithRelations(int $id): Trainee
    {
        return Trainee::with([
            'user',
            'attendanceRecords' => fn ($q) => $q->orderBy('session_date'),
            'evaluations'       => fn ($q) => $q->with('evaluator:id,name')->orderByDesc('evaluation_date'),
        ])->findOrFail($id);
    }

    /**
     * Find a trainee by their user_id.
     */
    public function findByUserId(int $userId): ?Trainee
    {
        return Trainee::where('user_id', $userId)->first();
    }

    /**
     * Create a new trainee profile record.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): Trainee
    {
        return Trainee::create($data);
    }

    /**
     * Update an existing trainee record.
     *
     * @param array<string, mixed> $data
     */
    public function update(Trainee $trainee, array $data): Trainee
    {
        $trainee->update($data);

        return $trainee->fresh();
    }

    /**
     * Soft-delete a trainee record.
     */
    public function delete(Trainee $trainee): void
    {
        $trainee->delete();
    }

    /**
     * Retrieve all trainee IDs belonging to a given talent group.
     * Used for scoping attendance and evaluation queries.
     *
     * @return \Illuminate\Support\Collection<int, int>
     */
    public function getIdsByTalentGroup(?string $talentGroup): \Illuminate\Support\Collection
    {
        return Trainee::query()
            ->whereHas('user', fn ($q) => $q->when(
                $talentGroup,
                fn ($q2) => $q2->where('talent_group', $talentGroup)
            ))
            ->pluck('id');
    }

    /**
     * Retrieve multiple trainees by their IDs (for batch operations).
     *
     * @param  int[]  $ids
     * @return Collection<int, Trainee>
     */
    public function findManyByIds(array $ids): Collection
    {
        return Trainee::whereIn('id', $ids)->get();
    }

    /**
     * firstOrCreate a trainee profile — used during application approval.
     *
     * @param array<string, mixed> $search
     * @param array<string, mixed> $create
     */
    public function firstOrCreate(array $search, array $create): Trainee
    {
        return Trainee::firstOrCreate($search, $create);
    }
}
