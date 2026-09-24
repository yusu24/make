<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'type',
        'display_type',
        'target',
        'status',
        'content',
        'action_url',
        'action_text',
        'date',
        'expires_at',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'expires_at' => 'datetime',
    ];
}
