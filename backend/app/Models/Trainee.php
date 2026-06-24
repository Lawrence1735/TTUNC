<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trainee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'application_id',    // FK to applications — null for old members seeded directly
        'completion_rate',   // cached % — update on chapters_completed save
        'current_status',
        'chapter',           // human-readable label for current chapter (e.g. "Chapter 5")
        'chapters_completed',
        'instrument',        // source of truth for marching-band classification
        'voice',             // source of truth for glee-club classification
        'deactivation_note',
        'total_expected_sessions',
        'date_joined',
    ];

    protected $casts = [
        'date_joined'        => 'date',
        'chapters_completed' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
}
