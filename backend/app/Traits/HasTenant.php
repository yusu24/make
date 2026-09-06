<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;

trait HasTenant
{
    /**
     * Boot the trait for a model.
     *
     * @return void
     */
    protected static function bootHasTenant()
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (empty($model->tenant_id)) {
                $user = auth('sanctum')->user() ?: auth()->user();
                if ($user && !empty($user->tenant_id)) {
                    $model->tenant_id = $user->tenant_id;
                } elseif (request() && request()->header('X-Tenant-ID')) {
                    $model->tenant_id = request()->header('X-Tenant-ID');
                }
            }
        });
    }
}
