<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = ['name', 'key_prefix', 'hashed_key', 'last_used_at', 'created_by'];

    protected $hidden = ['hashed_key'];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
