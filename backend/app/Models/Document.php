<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    protected $fillable = [
        'title',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'category',
        'talent_group',
        'related_to',
        'uploaded_by',
        'description',
        'tags',
        'status',
        'user_id',
    ];

    protected $casts = [
        'tags'          => 'array',
        'uploaded_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
