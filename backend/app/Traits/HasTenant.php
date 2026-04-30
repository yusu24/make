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
            if (empty($model->tenant_id) && auth()->check()) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}
