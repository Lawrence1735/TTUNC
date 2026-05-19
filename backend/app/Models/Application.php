<?php

declare(strict_types=1);

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
 * @property string      $status          pending|interview_scheduled|approved|rejected
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
{
    use HasFactory;
    use SoftDeletes;

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

    protected function casts(): array
    {
        return [
            'documents'   => 'array',
            'applied_at'  => 'datetime',
            'applicant_birthdate' => 'date',
            'applications_this_week_tracker' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * The user account linked to this application (nullable until account creation).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The scheduled interview for this application (one-to-one).
     */
    public function interview(): HasOne
    {
        return $this->hasOne(Interview::class);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Returns a structured personalInfo array matching the frontend shape.
     * Appended to JSON serialisation via $appends.
     */
    public function getPersonalInfoAttribute(): array
    {
        return [
            'name'             => $this->applicant_name,
            'email'            => $this->applicant_email,
            'studentId'        => $this->applicant_student_id,
            'phone'            => $this->applicant_phone,
            'birthdate'        => $this->applicant_birthdate?->toDateString(),
            'age'              => $this->applicant_age,
            'address'          => $this->applicant_address,
            'gender'           => $this->applicant_gender,
            'yearLevel'        => $this->applicant_year_level,
            'course'           => $this->applicant_course,
            'department'       => $this->applicant_department,
            'guardianName'     => $this->guardian_name,
            'guardianContactNo'=> $this->guardian_phone,
            'guardianRelationship' => $this->guardian_relationship,
        ];
    }

    protected $appends = ['personal_info'];
}
