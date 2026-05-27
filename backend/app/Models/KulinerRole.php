<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KulinerRole extends Model
{
    use HasFactory;

    protected $fillable = ['tenant_id', 'name', 'permissions'];

    protected $casts = [
        'permissions' => 'json'
    ];
}
