<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'session_date',
        'no_practice',
        'status',
        'notes',
    ];

    protected $casts = [
        'session_date' => 'date',
        'no_practice'  => 'boolean',
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }
}
