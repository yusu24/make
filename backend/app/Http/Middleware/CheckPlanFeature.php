<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SubscriptionPlan;

class CheckPlanFeature
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        $user = $request->user();
        if (!$user) {
            $tenantId = $request->query('tenant_id') ?: $request->header('X-Tenant-ID');
            if ($tenantId && $tenantId !== 'undefined') {
                $normalizedId = str_replace('_', '-', $tenantId);
                $tenant = \App\Models\Tenant::where('tenant_id', $normalizedId)->orWhere('tenant_id', $tenantId)->first();
            } else {
                $tenant = null;
            }
        } else {
            // Demo sandboxes & Super Admin bypass feature checks
            if ($user->role === 'super_admin') {
                return $next($request);
            }

            $tenantId = $user->tenant_id;
            if ($tenantId && (str_starts_with($tenantId, 'TN-DS-') || str_starts_with($tenantId, 'TN-DK-'))) {
                return $next($request);
            }

            $tenant = $user->tenant;
        }

        if (!$tenant) {
            return $next($request);
        }

        // Ambil plan aktif tenant berdasarkan business_category_id & subscription_plan
        $plan = \App\Models\SubscriptionPlan::forTenant($tenant);
        if (!$plan || !is_array($plan->features)) {
            return $next($request);
        }

        $features = $plan->features;
        if (array_key_exists($featureKey, $features) && !$features[$featureKey]) {
            return response()->json([
                'success' => false,
                'disabled' => true,
                'message' => "Fitur '{$featureKey}' tidak diizinkan pada paket " . strtoupper($tenant->subscription_plan) . " toko ini. Silakan hubungi admin untuk upgrade paket.",
                'error_code' => 'FEATURE_NOT_AVAILABLE',
                'required_feature' => $featureKey
            ], 403);
        }

        return $next($request);
    }
}
