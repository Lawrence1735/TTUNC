<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Engagement extends Model
{
    protected $fillable = [
        'event_name',
        'description',
        'date',
        'time',
        'venue',
        'venue_region',
        'venue_province',
        'venue_city',
        'venue_barangay',
        'venue_street',
        'organization_name',
        'contact_person',
        'contact_email',
        'contact_phone',
        'attachments',
        'talent_groups',
        'type',
        'is_required',
        'status',
        'created_by',
    ];

    protected $casts = [
        'attachments'   => 'array',
        'talent_groups' => 'array',
        'date'          => 'date',
        'is_required'   => 'boolean',
    ];

    public function createdBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
