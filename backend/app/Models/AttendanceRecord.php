<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int              $id
 * @property int              $trainee_id
 * @property \Carbon\Carbon   $session_date
 * @property bool             $no_practice   When true, excluded from rate calculations
 * @property string           $status        present|absent
 * @property string|null      $notes
 */
final class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'session_date',
        'no_practice',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
            'no_practice'  => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Scope to only practice days (no_practice = false).
     */
    public function scopePracticeDays(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('no_practice', false);
    }

    /**
     * Scope to only present records.
     */
    public function scopePresent(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'present');
    }
}
