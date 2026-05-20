<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'talent_group',
        'status',
        'applications_this_week_tracker',
        'applicant_name',
        'applicant_email',
        'applicant_student_id',
        'applicant_phone',
        'applicant_birthdate',
        'applicant_age',
        'applicant_address',
        'applicant_gender',
        'applicant_year_level',
        'applicant_course',
        'applicant_department',
        'guardian_name',
        'guardian_phone',
        'guardian_relationship',
        'chapters',
        'instruments',
        'voices',
        'vocal_range',
        'primary_dance_genre',
        'years_of_experience',
        'experience',
        'motivation',
        'documents',
        'portfolio_url',
        'denial_reason',
        'denial_feedback',
        'approval_notes',
        'applied_at',
    ];

    protected $casts = [
        'documents'   => 'array',
        'applied_at'  => 'datetime',
        'applicant_birthdate' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interview(): HasOne
    {
        return $this->hasOne(Interview::class);
    }
}
