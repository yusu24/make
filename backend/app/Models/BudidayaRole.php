<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class BudidayaRole extends Model
{
    use HasTenant;

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'description', 'is_system', 'permissions',
    ];

    protected $casts = [
        'is_system'   => 'boolean',
        'permissions' => 'array',
    ];

    public function staff()
    {
        return $this->hasMany(BudidayaStaff::class, 'budidaya_role_id');
    }
}
