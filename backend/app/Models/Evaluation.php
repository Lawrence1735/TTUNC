<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evaluation extends Model
{
    use HasFactory, SoftDeletes;

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
        'scholarship_percentage',
        'evaluation_date',
    ];

    protected $casts = [
        'section_a'             => 'array',
        'section_b'             => 'array',
        'section_c'             => 'array',
        'recommend_for_renewal' => 'boolean',
        'evaluation_date'       => 'date',
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
