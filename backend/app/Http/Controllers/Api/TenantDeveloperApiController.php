<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ApiKey;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TenantDeveloperApiController extends Controller
{
    /**
     * Check if user's tenant has valid API access permission.
     */
    protected function hasApiAccess(Request $request): bool
    {
        $user = $request->user();
        if (!$user) return false;

        if ($user->role === 'super_admin') return true;

        $tenantId = $user->tenant_id;
        if (!$tenantId) return false;

        // Demo sandbox bypass
        if (str_starts_with($tenantId, 'TN-DS-') || str_starts_with($tenantId, 'TN-DK-') || str_starts_with($user->email ?? '', 'demo-')) {
            return true;
        }

        $tenant = Tenant::where('tenant_id', $tenantId)->first();
        if (!$tenant) return false;

        // Check expiration
        $now = now();
        $expiresAt = $tenant->subscription_expires_at ?? $tenant->trial_ends_at;
        if ($tenant->status === 'expired' || ($expiresAt && $now->greaterThan($expiresAt))) {
            return false;
        }
        if ($tenant->status === 'suspended') {
            return false;
        }

        // Check plan feature
        $plan = SubscriptionPlan::forTenant($tenant);
        if ($plan && is_array($plan->features)) {
            if (!empty($plan->features['apiAccess']) || !empty($plan->features['api_access'])) {
                return true;
            }
        }

        // Check if tenant has enterprise or custom settings enabling API
        if ($tenant->subscription_plan === 'enterprise' || $tenant->subscription_plan === 'pro_developer') {
            return true;
        }

        return false;
    }

    /**
     * Get integration status & permission for current tenant
     */
    public function status(Request $request)
    {
        $hasAccess = $this->hasApiAccess($request);
        $user = $request->user();
        $tenant = Tenant::where('tenant_id', $user->tenant_id)->first();

        return response()->json([
            'success' => true,
            'has_access' => $hasAccess,
            'tenant_id' => $user->tenant_id,
            'subscription_plan' => $tenant->subscription_plan ?? 'free',
            'subscription_status' => $tenant->subscription_status ?? 'active',
        ]);
    }

    // ─── Tenant API Keys ───────────────────────────────────────────────────────

    public function indexKeys(Request $request)
    {
        $user = $request->user();
        $keys = ApiKey::where('tenant_id', $user->tenant_id)
            ->with('creator:id,name')
            ->latest()
            ->get(['id', 'tenant_id', 'name', 'key_prefix', 'last_used_at', 'created_by', 'created_at']);

        return response()->json([
            'success' => true,
            'has_access' => $this->hasApiAccess($request),
            'data' => $keys
        ]);
    }

    public function storeKey(Request $request)
    {
        if (!$this->hasApiAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur Akses API Developer belum aktif untuk paket langganan Anda. Silakan upgrade paket Anda di menu Langganan.',
                'error_code' => 'API_ACCESS_REQUIRED'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $rawKey = 'bzr_live_' . Str::random(40);

        $key = ApiKey::create([
            'tenant_id' => $user->tenant_id,
            'name' => $request->name,
            'key_prefix' => substr($rawKey, 0, 12) . '...',
            'hashed_key' => hash('sha256', $rawKey),
            'created_by' => $user->id,
        ]);

        ActivityLog::record('create_tenant_api_key', 'Tenant API Key: ' . $key->name, 'success');

        return response()->json([
            'success' => true,
            'message' => 'Kunci API berhasil dibuat! Pastikan Anda menyalin kuncinya sekarang karena tidak akan ditampilkan lagi.',
            'data' => [
                'id' => $key->id,
                'name' => $key->name,
                'key_prefix' => $key->key_prefix,
                'raw_key' => $rawKey, // only returned once
                'created_at' => $key->created_at,
            ],
        ], 201);
    }

    public function destroyKey(Request $request, $id)
    {
        $user = $request->user();
        $key = ApiKey::where('tenant_id', $user->tenant_id)->findOrFail($id);
        
        ActivityLog::record('revoke_tenant_api_key', 'Tenant API Key: ' . $key->name, 'danger');
        $key->delete();

        return response()->json(['success' => true, 'message' => 'Kunci API berhasil dicabut']);
    }

    // ─── Tenant Webhooks ───────────────────────────────────────────────────────

    public function indexWebhooks(Request $request)
    {
        $user = $request->user();
        $webhooks = Webhook::where('tenant_id', $user->tenant_id)
            ->with('creator:id,name')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'has_access' => $this->hasApiAccess($request),
            'data' => $webhooks
        ]);
    }

    public function storeWebhook(Request $request)
    {
        if (!$this->hasApiAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur Webhook belum aktif untuk paket langganan Anda. Silakan upgrade paket Anda di menu Langganan.',
                'error_code' => 'API_ACCESS_REQUIRED'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'url' => 'required|url|max:2048',
            'events' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $secretKey = 'whsec_' . Str::random(32);

        $webhook = Webhook::create([
            'tenant_id' => $user->tenant_id,
            'url' => $request->url,
            'events' => $request->events ?? ['order.created', 'payment.success', 'stock.low'],
            'secret_key' => $secretKey,
            'is_active' => true,
            'created_by' => $user->id,
        ])->load('creator:id,name');

        ActivityLog::record('create_tenant_webhook', 'Tenant Webhook: ' . $webhook->url, 'success');

        return response()->json([
            'success' => true,
            'message' => 'Webhook berhasil didaftarkan!',
            'data' => $webhook
        ], 201);
    }

    public function toggleWebhook(Request $request, $id)
    {
        $user = $request->user();
        $webhook = Webhook::where('tenant_id', $user->tenant_id)->findOrFail($id);
        $webhook->update(['is_active' => !$webhook->is_active]);

        return response()->json([
            'success' => true,
            'message' => $webhook->is_active ? 'Webhook diaktifkan' : 'Webhook dinonaktifkan',
            'data' => $webhook
        ]);
    }

    public function destroyWebhook(Request $request, $id)
    {
        $user = $request->user();
        $webhook = Webhook::where('tenant_id', $user->tenant_id)->findOrFail($id);
        $webhook->delete();

        return response()->json(['success' => true, 'message' => 'Webhook berhasil dihapus']);
    }

    public function testWebhook(Request $request, $id)
    {
        $user = $request->user();
        $webhook = Webhook::where('tenant_id', $user->tenant_id)->findOrFail($id);

        $payload = [
            'event' => 'ping.test',
            'tenant_id' => $user->tenant_id,
            'timestamp' => now()->toIso8601String(),
            'message' => 'Tes simulasi pengiriman Webhook dari Bizora Cloud Platform berhasil terkirim!',
            'data' => [
                'ping_id' => Str::uuid()->toString(),
                'sample_order' => [
                    'order_number' => 'ORD-TEST-' . strtoupper(Str::random(6)),
                    'total_amount' => 150000,
                    'status' => 'paid',
                ]
            ]
        ];

        try {
            $response = Http::timeout(6)
                ->withHeaders([
                    'X-Bizora-Signature' => hash_hmac('sha256', json_encode($payload), $webhook->secret_key ?? 'secret'),
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'Bizora-Webhook-Dispatcher/2.0'
                ])
                ->post($webhook->url, $payload);

            return response()->json([
                'success' => true,
                'message' => "Ping berhasil dikirim! Response Status HTTP: {$response->status()}",
                'http_status' => $response->status(),
                'payload_sent' => $payload,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim webhook ke URL target: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
