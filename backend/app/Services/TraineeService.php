<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Trainee;
use App\Repositories\TraineeRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Business logic for Trainee CRUD operations.
 *
 * The service is the only place that knows about business rules:
 * - What fields are allowed to be updated
 * - What side-effects happen after a write (e.g. recalculating completion rate)
 * - What constitutes a valid state transition
 *
 * It delegates all DB access to TraineeRepository and never touches
 * HTTP concerns (Request, Response, status codes).
 */
final class TraineeService
{
    public function __construct(
        private readonly TraineeRepository $repository,
    ) {}

    /**
     * Return a paginated trainee list scoped to the director's talent group.
     */
    public function list(
        ?string $talentGroup,
        ?string $search,
        ?string $status,
        int $perPage = 50
    ): LengthAwarePaginator {
        return $this->repository->paginate($talentGroup, $search, $status, $perPage);
    }

    /**
     * Return a single trainee with all relations loaded.
     */
    public function getWithRelations(int $id): Trainee
    {
        return $this->repository->findWithRelations($id);
    }

    /**
     * Update a trainee's profile fields.
     *
     * Only the fields a director is allowed to change are accepted here.
     * The completion_rate column is managed exclusively by the attendance
     * system — it is stripped from the payload to prevent manual overrides.
     *
     * @param array<string, mixed> $data
     */
    public function update(Trainee $trainee, array $data): Trainee
    {
        // Guard: never allow manual override of the cached completion_rate
        unset($data['completion_rate'], $data['user_id']);

        return $this->repository->update($trainee, $data);
    }

    /**
     * Soft-delete a trainee record.
     *
     * Business rule: a trainee with active attendance records can still be
     * deleted (soft) — their history is preserved. Hard deletes are not
     * exposed via the API.
     */
    public function delete(Trainee $trainee): void
    {
        $this->repository->delete($trainee);
    }

    /**
     * Return per-trainee stats payload for the stats endpoint.
     *
     * @return array<string, mixed>
     */
    public function stats(Trainee $trainee): array
    {
        // Load user relation for the resource
        $trainee->load('user:id,name,student_id,talent_group');

        return [
            'trainee'            => $trainee,
            'completion_rate'    => $trainee->computed_completion_rate,
            'attendance_rate'    => $trainee->attendance_rate,
        ];
    }
}
