<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int         $id
 * @property int|null    $user_id
 * @property string      $talent_group
 * @property string      $status            pending|interview_scheduled|approved|rejected
 * @property int         $applications_this_week_tracker
 * @property string      $applicant_name    Denorm — always stored (mirrors user.name once account exists)
 * @property string      $applicant_email   Denorm — always stored
 * @property string|null $applicant_student_id
 * @property string|null $applicant_age
 * @property \Carbon\Carbon $applied_at
 */
class Application extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'talent_group',
        'status',
        'applications_this_week_tracker',
        // Applicant info (denorm; required even when user_id is set so application is self-contained)
        'applicant_name',
        'applicant_email',
        'applicant_student_id',
        'applicant_phone',
        'applicant_birthdate',
        'applicant_age',
        'applicant_address',
        'residing_address',
        'applicant_gender',
        'applicant_year_level',
        'applicant_course',
        'applicant_department',
        'guardian_name',
        'guardian_phone',
        'guardian_relationship',
        'photo_path',
        // Outcome
        'denial_reason',
        'denial_feedback',
        'approval_notes',
        'applied_at',
        // Removed (not part of the application form):
        //   social_media, vocal_range, primary_dance_genre, years_of_experience, documents, portfolio_url
    ];

    protected $casts = [
        'applied_at'          => 'datetime',
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
