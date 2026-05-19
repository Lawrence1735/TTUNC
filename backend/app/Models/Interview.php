<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int              $id
 * @property int              $application_id
 * @property int              $reviewer_id
 * @property \Carbon\Carbon   $scheduled_at
 * @property string|null      $venue
 * @property string|null      $notes
 * @property string           $outcome    pending|passed|failed|no_show
 * @property string|null      $outcome_notes
 * @property \Carbon\Carbon|null $completed_at
 */
final class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'reviewer_id',
        'scheduled_at',
        'venue',
        'notes',
        'outcome',
        'outcome_notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
