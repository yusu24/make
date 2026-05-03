<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'display_name'];

    public function tenants()
    {
        return $this->belongsToMany(Tenant::class, 'business_modules', 'module_id', 'tenant_id', 'id', 'tenant_id')
                    ->withPivot('is_active');
    }
}
