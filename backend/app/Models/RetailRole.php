<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailRole extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
