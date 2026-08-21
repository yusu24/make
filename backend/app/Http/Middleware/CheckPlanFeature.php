<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class CheckPlanFeature
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $featureKey): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Demo sandboxes bypass feature checks.
        $tenantId = $user->tenant_id;
        if ($tenantId && (str_starts_with($tenantId, 'TN-DS-') || str_starts_with($tenantId, 'TN-DK-'))) {
            return $next($request);
        }

        $tenant = $user->tenant;
        if (!$tenant) {
            if ($user->role === 'super_admin' || $user->role === 'admin') {
                return $next($request);
            }
            return response()->json(['message' => 'Tenant not found.'], 403);
        }

        // Ambil plan saat ini
        $planSlug = $tenant->subscription_plan; // misal: 'free', 'basic', 'pro'
        
        $plan = DB::table('subscription_plans')->where('slug', $planSlug)->first();
        if (!$plan) {
            return response()->json(['message' => 'Paket langganan Anda tidak ditemukan atau tidak valid.'], 403);
        }

        $hasFeature = DB::table('package_features')
            ->where('plan_id', $plan->id)
            ->where('feature_key', $featureKey)
            ->exists();

        if (!$hasFeature) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur ini tidak tersedia di paket Anda. Silakan upgrade paket berlangganan.',
                'error_code' => 'FEATURE_NOT_AVAILABLE',
                'required_feature' => $featureKey
            ], 403);
        }

        return $next($request);
    }
}
