<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Application;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * All Eloquent query logic for the Application model.
 */
final class ApplicationRepository
{
    /**
     * Paginated application list with optional filters.
     */
    public function paginate(
        ?string $talentGroup,
        ?string $status,
        ?string $search,
        int $perPage = 20
    ): LengthAwarePaginator {
        return Application::query()
            ->with(['interview.reviewer:id,name'])
            ->when($talentGroup, fn ($q) => $q->where('talent_group', $talentGroup))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q) use ($search): void {
                $term = '%' . $search . '%';
                $q->where(fn ($inner) => $inner
                    ->where('applicant_name', 'like', $term)
                    ->orWhere('applicant_student_id', 'like', $term)
                    ->orWhere('applicant_email', 'like', $term)
                );
            })
            ->orderByDesc('applied_at')
            ->paginate($perPage);
    }

    /**
     * Find a single application with interview and user loaded.
     */
    public function findWithRelations(int $id): Application
    {
        return Application::with(['interview.reviewer', 'user'])->findOrFail($id);
    }

    /**
     * Create a new application record.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): Application
    {
        return Application::create($data);
    }

    /**
     * Update an application record.
     *
     * @param array<string, mixed> $data
     */
    public function update(Application $application, array $data): Application
    {
        $application->update($data);

        return $application->fresh();
    }
}
