<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\AttendanceRecord;
use Illuminate\Database\Eloquent\Collection;

/**
 * All Eloquent query logic for AttendanceRecord.
 */
final class AttendanceRepository
{
    /**
     * Fetch attendance records for a set of trainee IDs,
     * optionally filtered by date range.
     *
     * @param  \Illuminate\Support\Collection<int, int>  $traineeIds
     * @return Collection<int, AttendanceRecord>
     */
    public function getForTrainees(
        \Illuminate\Support\Collection $traineeIds,
        ?string $dateFrom,
        ?string $dateTo
    ): Collection {
        return AttendanceRecord::query()
            ->whereIn('trainee_id', $traineeIds)
            ->when($dateFrom, fn ($q) => $q->where('session_date', '>=', $dateFrom))
            ->when($dateTo,   fn ($q) => $q->where('session_date', '<=', $dateTo))
            ->orderBy('session_date')
            ->orderBy('trainee_id')
            ->get();
    }

    /**
     * Bulk upsert attendance rows on the unique (trainee_id, session_date) key.
     *
     * @param array<int, array<string, mixed>> $rows
     */
    public function bulkUpsert(array $rows): void
    {
        AttendanceRecord::upsert(
            $rows,
            uniqueBy: ['trainee_id', 'session_date'],
            update: ['no_practice', 'status', 'notes', 'updated_at'],
        );
    }

    /**
     * Monthly attendance aggregation for a single trainee (MySQL).
     *
     * @return Collection<int, object>
     */
    public function monthlyAggregation(int $traineeId): Collection
    {
        return AttendanceRecord::query()
            ->where('trainee_id', $traineeId)
            ->where('no_practice', false)
            ->selectRaw("
                DATE_FORMAT(session_date, '%Y-%m') AS month,
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
                ROUND(
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100,
                    1
                ) AS attendance_rate
            ")
            ->groupByRaw("DATE_FORMAT(session_date, '%Y-%m')")
            ->orderByRaw("DATE_FORMAT(session_date, '%Y-%m')")
            ->get();
    }
}
