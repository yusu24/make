<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'type',
        'target',
        'status',
        'content',
        'date',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];
}
