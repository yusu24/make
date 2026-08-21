<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Demo sandboxes bypass subscription check.
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

        // Cek status kedaluwarsa. Prioritaskan expires_at jika ada, lalu trial_ends_at.
        $now = now();
        $expiresAt = $tenant->expires_at ?? $tenant->trial_ends_at;

        if ($tenant->status === 'expired' || ($expiresAt && $now->greaterThan($expiresAt))) {
            return response()->json([
                'success' => false,
                'message' => 'Masa berlaku langganan Anda telah habis.',
                'error_code' => 'SUBSCRIPTION_EXPIRED'
            ], 402);
        }

        if ($tenant->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Akun tenant Anda ditangguhkan.',
                'error_code' => 'SUBSCRIPTION_SUSPENDED'
            ], 403);
        }

        return $next($request);
    }
}
