<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'name',
        'role',
        'avatar_text',
        'avatar_bg',
        'avatar_color',
        'stars',
        'text',
        'active',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'stars' => 'integer',
        'sort_order' => 'integer',
    ];
}
