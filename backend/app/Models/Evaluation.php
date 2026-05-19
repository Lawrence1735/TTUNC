<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int              $id
 * @property int              $trainee_id
 * @property int              $evaluator_id
 * @property int              $rating           1-100
 * @property array|null       $section_a
 * @property array|null       $section_b
 * @property array|null       $section_c
 * @property string|null      $notes
 * @property string|null      $strengths
 * @property string|null      $improvements
 * @property string           $recommendation   continue|probation|discontinue
 * @property string           $status           draft|submitted
 * @property string|null      $semester
 * @property string|null      $academic_year
 * @property string|null      $adjectival_rating
 * @property bool             $recommend_for_renewal
 * @property \Carbon\Carbon   $evaluation_date
 */
final class Evaluation extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'trainee_id',
        'evaluator_id',
        'rating',
        'section_a',
        'section_b',
        'section_c',
        'notes',
        'strengths',
        'improvements',
        'recommendation',
        'status',
        'semester',
        'academic_year',
        'adjectival_rating',
        'recommend_for_renewal',
        'evaluation_date',
    ];

    protected function casts(): array
    {
        return [
            'section_a'              => 'array',
            'section_b'              => 'array',
            'section_c'              => 'array',
            'rating'                 => 'integer',
            'recommend_for_renewal'  => 'boolean',
            'evaluation_date'        => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Derives the adjectival rating label from the numeric score.
     * Mirrors the frontend getScoreColor thresholds.
     */
    public function getAdjectivalRatingLabelAttribute(): string
    {
        return match (true) {
            $this->rating >= 90 => 'Outstanding',
            $this->rating >= 75 => 'Very Satisfactory',
            $this->rating >= 60 => 'Satisfactory',
            $this->rating >= 50 => 'Fairly Satisfactory',
            default             => 'Unsatisfactory',
        };
    }
}
