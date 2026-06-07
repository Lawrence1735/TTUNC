<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Engagement extends Model
{
    protected $fillable = [
        'event_name',
        'description',
        'date',
        'time',
        'venue',
        'talent_groups',
        'type',
        'is_required',
        'status',
    ];

    protected $casts = [
        'talent_groups' => 'array',
        'date'          => 'date',
        'is_required'   => 'boolean',
    ];
}
