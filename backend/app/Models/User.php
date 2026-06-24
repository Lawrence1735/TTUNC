<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'talent_group',
        'student_id',
        'phone',
        'year_level',
        'course',
        'department',
        'address',
        // Note: application_status removed — use Application::status instead
        // Note: training_status removed — use Trainee::current_status instead
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function trainee(): HasOne
    {
        return $this->hasOne(Trainee::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function reviewedInterviews(): HasMany
    {
        return $this->hasMany(Interview::class, 'reviewer_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'evaluator_id');
    }
}
