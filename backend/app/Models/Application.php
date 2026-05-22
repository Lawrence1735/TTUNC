<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

<<<<<<< HEAD
/**
 * @property int         $id
 * @property int|null    $user_id
 * @property string      $talent_group
 * @property string      $status          pending|scheduled|approved|rejected
 * @property int         $applications_this_week_tracker
 * @property string      $applicant_name
 * @property string      $applicant_email
 * @property string|null $applicant_student_id
 * @property string|null $chapters
 * @property string|null $instruments
 * @property string|null $voices
 * @property array|null  $documents
 * @property string|null $portfolio_url
 * @property string|null $denial_reason
 * @property string|null $denial_feedback
 * @property string|null $approval_notes
 * @property \Carbon\Carbon $applied_at
 */
final class Application extends Model
=======
class Application extends Model
>>>>>>> origin/main
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
        'performed_on_stage',
        'willing_to_attend_rehearsals',
        'has_band_experience',
        'previous_singing_experience',
        'musical_background',
        'previous_majorette_team',
        'previous_organization',
        'can_perform_basic_routines',
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
