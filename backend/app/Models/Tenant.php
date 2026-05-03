<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'type', 'tenant_id', 'user_id', 'subscription_plan', 'status', 
        'business_category_id', 'business_name', 'address', 'phone', 'settings'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function businessCategory()
    {
        return $this->belongsTo(BusinessCategory::class);
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'business_modules', 'tenant_id', 'module_id', 'tenant_id', 'id')
                    ->withPivot('is_active');
    }

    public function hasModule(string $moduleName): bool
    {
        return $this->modules()
                    ->where('name', $moduleName)
                    ->where('is_active', true)
                    ->exists();
    }
}
