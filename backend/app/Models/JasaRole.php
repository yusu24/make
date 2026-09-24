<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class JasaRole extends Model
{
    use HasTenant;

    protected $table = 'jasa_roles';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'jasa_role_id');
    }
}
