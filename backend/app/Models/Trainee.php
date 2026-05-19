<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int         $id
 * @property int         $user_id
 * @property int         $completion_rate          Cached 0-100 value
 * @property string      $current_status           active|inactive|completed|dropped
 * @property string|null $chapter
 * @property string|null $instrument
 * @property string|null $voice
 * @property int         $total_expected_sessions
 * @property \Carbon\Carbon|null $date_joined
 *
 * @property-read int    $computed_completion_rate  Live-computed from attendance
 * @property-read int    $attendance_rate           Percentage of practice days attended
 */
final class Trainee extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'completion_rate',
        'current_status',
        'chapter',
        'instrument',
        'voice',
        'total_expected_sessions',
        'date_joined',
    ];

    protected function casts(): array
    {
        return [
            'completion_rate'          => 'integer',
            'total_expected_sessions'  => 'integer',
            'date_joined'              => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    // ─── Computed Accessors ───────────────────────────────────────────────────

    /**
     * Dynamically computes the training completion rate from attendance records.
     *
     * Only sessions where no_practice = false are counted as valid practice days.
     * The rate is: (present practice days / total expected sessions) * 100.
     *
     * This accessor is used when a precise live value is needed (e.g. trainee
     * profile view). The cached `completion_rate` column is used for fast
     * bulk dashboard queries.
     */
    public function getComputedCompletionRateAttribute(): int
    {
        $practiceDays = $this->attendanceRecords()
            ->where('no_practice', false)
            ->count();

        $presentDays = $this->attendanceRecords()
            ->where('no_practice', false)
            ->where('status', 'present')
            ->count();

        if ($this->total_expected_sessions === 0) {
            return 0;
        }

        return (int) round(($presentDays / $this->total_expected_sessions) * 100);
    }

    /**
     * Attendance rate: present practice days / total non-no_practice days.
     * Differs from completion_rate which uses total_expected_sessions as denominator.
     */
    public function getAttendanceRateAttribute(): int
    {
        $practiceDays = $this->attendanceRecords()
            ->where('no_practice', false)
            ->count();

        if ($practiceDays === 0) {
            return 0;
        }

        $presentDays = $this->attendanceRecords()
            ->where('no_practice', false)
            ->where('status', 'present')
            ->count();

        return (int) round(($presentDays / $practiceDays) * 100);
    }

    /**
     * Recalculates and persists the cached completion_rate column.
     * Call this after any batch attendance write.
     */
    public function recalculateAndSaveCompletionRate(): void
    {
        $this->completion_rate = $this->getComputedCompletionRateAttribute();
        $this->saveQuietly();
    }

    protected $appends = ['computed_completion_rate', 'attendance_rate'];
}
