<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KulinerPromo extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'type',
        'value',
        'description',
        'quota',
        'used_count',
        'expired_at',
        'status'
    ];

    protected $casts = [
        'expired_at' => 'datetime',
        'quota' => 'integer',
        'used_count' => 'integer',
    ];
}
