<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Repositories\AttendanceRepository;
use App\Repositories\TraineeRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Business logic for attendance tracking.
 *
 * Owns the rule: no_practice days are excluded from completion rate
 * calculations. After any write, affected trainees have their cached
 * completion_rate column recalculated.
 */
final class AttendanceService
{
    public function __construct(
        private readonly AttendanceRepository $attendanceRepository,
        private readonly TraineeRepository    $traineeRepository,
    ) {}

    /**
     * Fetch the attendance matrix for a talent group, optionally date-filtered.
     *
     * @return Collection<int, AttendanceRecord>
     */
    public function getMatrix(
        ?string $talentGroup,
        ?string $dateFrom,
        ?string $dateTo
    ): Collection {
        $traineeIds = $this->traineeRepository->getIdsByTalentGroup($talentGroup);

        return $this->attendanceRepository->getForTrainees($traineeIds, $dateFrom, $dateTo);
    }

    /**
     * Batch upsert attendance for a session date.
     * Recalculates completion_rate for all affected trainees after the write.
     *
     * @param array<int, array{trainee_id: int, status: string, notes?: string}> $records
     */
    public function batchUpsert(
        string $sessionDate,
        bool $noPractice,
        array $records
    ): void {
        DB::transaction(function () use ($sessionDate, $noPractice, $records): void {
            $now  = now();
            $rows = array_map(fn (array $r): array => [
                'trainee_id'   => $r['trainee_id'],
                'session_date' => $sessionDate,
                'no_practice'  => $noPractice,
                'status'       => $noPractice ? 'absent' : ($r['status'] ?? 'absent'),
                'notes'        => $r['notes'] ?? null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ], $records);

            $this->attendanceRepository->bulkUpsert($rows);

            $traineeIds = array_unique(array_column($records, 'trainee_id'));

            $this->traineeRepository
                ->findManyByIds($traineeIds)
                ->each(fn ($trainee) => $trainee->recalculateAndSaveCompletionRate());
        });
    }

    /**
     * Toggle the no_practice flag on a single record and recalculate
     * the owning trainee's completion rate.
     */
    public function toggleNoPractice(AttendanceRecord $record): AttendanceRecord
    {
        DB::transaction(function () use ($record): void {
            $record->update(['no_practice' => ! $record->no_practice]);
            $record->trainee->recalculateAndSaveCompletionRate();
        });

        return $record->fresh();
    }
}
