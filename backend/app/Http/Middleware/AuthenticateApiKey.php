<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request authenticated via X-API-KEY or Bearer token.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $rawKey = $request->header('X-API-KEY') ?: $request->bearerToken();

        if (!$rawKey) {
            return response()->json([
                'success' => false,
                'message' => 'Kunci API tidak ditemukan. Sertakan header X-API-KEY atau Authorization: Bearer {token}.',
                'error_code' => 'API_KEY_MISSING'
            ], 401);
        }

        $hashedKey = hash('sha256', trim($rawKey));
        $apiKey = ApiKey::where('hashed_key', $hashedKey)->first();

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Kunci API tidak valid atau telah dicabut.',
                'error_code' => 'INVALID_API_KEY'
            ], 401);
        }

        // If it's a tenant-scoped API key, check tenant status & subscription
        if ($apiKey->tenant_id) {
            $tenantId = $apiKey->tenant_id;
            $tenant = Tenant::where('tenant_id', $tenantId)->first();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Toko / Tenant pemilik API Key tidak ditemukan.',
                    'error_code' => 'TENANT_NOT_FOUND'
                ], 404);
            }

            // Check if demo bypass
            $isDemo = str_starts_with($tenantId, 'TN-DS-') || str_starts_with($tenantId, 'TN-DK-');

            if (!$isDemo) {
                $now = now();
                $expiresAt = $tenant->subscription_expires_at ?? $tenant->trial_ends_at;

                if ($tenant->status === 'expired' || ($expiresAt && $now->greaterThan($expiresAt))) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses API ditolak. Masa berlaku langganan toko telah berakhir. Silakan perpanjang paket langganan Anda.',
                        'error_code' => 'SUBSCRIPTION_EXPIRED'
                    ], 402);
                }

                if ($tenant->status === 'suspended') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses API ditolak. Akun toko ditangguhkan.',
                        'error_code' => 'TENANT_SUSPENDED'
                    ], 403);
                }

                // Check plan permission
                $plan = SubscriptionPlan::forTenant($tenant);
                $hasApiAccess = ($plan && is_array($plan->features) && (!empty($plan->features['apiAccess']) || !empty($plan->features['api_access'])))
                    || $tenant->subscription_plan === 'enterprise' 
                    || $tenant->subscription_plan === 'pro_developer';

                if (!$hasApiAccess) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses API ditolak. Fitur Akses API Developer belum diaktifkan pada paket langganan toko Anda.',
                        'error_code' => 'API_FEATURE_DISABLED'
                    ], 403);
                }
            }

            // Bind tenant context
            $request->attributes->set('tenant_id', $tenantId);
            $request->attributes->set('tenant', $tenant);
        }

        // Update last used timestamp asynchronously/quietly
        $apiKey->update(['last_used_at' => now()]);

        return $next($request);
    }
}
