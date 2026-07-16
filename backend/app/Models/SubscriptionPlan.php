<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'business_category_id', 'plan_key', 'name', 'price', 'max_products',
        'max_staff', 'features', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function businessCategory()
    {
        return $this->belongsTo(BusinessCategory::class);
    }

    public static function forTenant(?Tenant $tenant): ?self
    {
        if (!$tenant) {
            return null;
        }

        return static::where('business_category_id', $tenant->business_category_id)
            ->where('plan_key', $tenant->subscription_plan ?? 'free')
            ->first();
    }
}
