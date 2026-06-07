<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scholarship extends Model
{
    protected $fillable = [
        'user_id',
        'semester',
        'year',
        'gpa',
        'documents',
        'status',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'documents'   => 'array',
        'reviewed_at' => 'datetime',
        'gpa'         => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
