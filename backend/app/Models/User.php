<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int         $id
 * @property string      $name
 * @property string      $email
 * @property string|null $student_id
 * @property string      $role           admin|director|trainee|scholar|student
 * @property string|null $talent_group
 * @property string|null $phone
 * @property string|null $year_level
 * @property string|null $course
 * @property string|null $department
 * @property string|null $address
 * @property string|null $emergency_contact
 * @property string|null $emergency_phone
 * @property string|null $application_status
 * @property string|null $training_status
 * @property int|null    $scholarship_percentage
 * @property string|null $assigned_instrument
 * @property string|null $assigned_voice
 */
final class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'student_id',
        'password',
        'role',
        'talent_group',
        'phone',
        'year_level',
        'course',
        'department',
        'address',
        'emergency_contact',
        'emergency_phone',
        'application_status',
        'training_status',
        'scholarship_percentage',
        'assigned_instrument',
        'assigned_voice',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'               => 'hashed',
            'scholarship_percentage' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Applications submitted by this user (may be empty for directors/admins).
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * The trainee profile record for this user (one-to-one).
     */
    public function trainee(): HasOne
    {
        return $this->hasOne(Trainee::class);
    }

    /**
     * Interviews this user has been assigned to review (as director/admin).
     */
    public function reviewedInterviews(): HasMany
    {
        return $this->hasMany(Interview::class, 'reviewer_id');
    }

    /**
     * Evaluations this user has submitted (as evaluator).
     */
    public function submittedEvaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'evaluator_id');
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Convenience check for role-based guards.
     */
    public function isDirector(): bool
    {
        return $this->role === 'director';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTrainee(): bool
    {
        return $this->role === 'trainee' || $this->role === 'student';
    }
}
