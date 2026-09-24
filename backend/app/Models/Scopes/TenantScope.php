<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $tenantId = null;

        if (request()) {
            $tenantId = request()->attributes->get('tenant_id') ?? request()->user()?->tenant_id;
        }

        if (!$tenantId) {
            $user = auth('sanctum')->user() ?: auth()->user();
            $tenantId = $user?->tenant_id;
        }

        if (!empty($tenantId)) {
            $builder->where($model->getTable() . '.tenant_id', $tenantId);
        } elseif (request() && !app()->runningInConsole()) {
            // Fail-closed for HTTP requests without tenant context unless super_admin or admin
            $user = request()->user();
            if (!$user || ($user->role !== 'super_admin' && $user->role !== 'admin')) {
                $builder->whereRaw('1 = 0');
            }
        }
    }
}
