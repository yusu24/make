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
            $trustedTenantId = null;
            if (request()) {
                $trustedTenantId = request()->attributes->get('tenant_id') ?? request()->user()?->tenant_id;
            }
            if (!$trustedTenantId) {
                $user = auth('sanctum')->user() ?: auth()->user();
                $trustedTenantId = $user?->tenant_id;
            }

            if (!empty($trustedTenantId)) {
                $model->tenant_id = $trustedTenantId;
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('tenant_id') && $model->getOriginal('tenant_id') !== null) {
                $model->tenant_id = $model->getOriginal('tenant_id');
            }
        });
    }
}
