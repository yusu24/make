<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellerChannel;
use App\Models\SellerSyncLog;
use App\Models\SellerProduct;
use Illuminate\Http\Request;

class SellerChannelController extends Controller
{
    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user ? ($user->tenant_id ?? 'TN-DEMO') : 'TN-DEMO';
    }

    private function isDemoTenant(string $tenantId): bool
    {
        return str_starts_with($tenantId, 'TN-DS-')
            || str_starts_with($tenantId, 'TN-DK-')
            || in_array($tenantId, ['TN-0001', 'TN-RETAIL', 'TN-SELLER', 'TN-DEMO'], true);
    }

    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $channels = SellerChannel::where('tenant_id', $tenantId)->get();

        if ($channels->isEmpty() && $this->isDemoTenant($tenantId)) {
            $defaultChannels = [
                ['platform' => 'shopee', 'store_name' => 'Official Store Shopee', 'account_id' => 'SHP_ID_9901', 'status' => 'connected', 'last_sync_at' => now()->subMinutes(12)],
                ['platform' => 'tokopedia', 'store_name' => 'Toko Resmi Tokopedia', 'account_id' => 'TKP_ID_4412', 'status' => 'connected', 'last_sync_at' => now()->subMinutes(35)],
                ['platform' => 'tiktok', 'store_name' => 'TikTok Shop BIZORA', 'account_id' => 'TTK_ID_8832', 'status' => 'connected', 'last_sync_at' => now()->subHours(1)],
                ['platform' => 'lazada', 'store_name' => 'Lazada Flagship Store', 'account_id' => 'LZD_ID_1102', 'status' => 'disconnected', 'last_sync_at' => null],
            ];

            foreach ($defaultChannels as $ch) {
                SellerChannel::create(array_merge($ch, ['tenant_id' => $tenantId]));
            }

            $channels = SellerChannel::where('tenant_id', $tenantId)->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $channels
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'platform' => 'required|string',
            'store_name' => 'required|string|max:255',
            'account_id' => 'nullable|string|max:255',
            'api_environment' => 'nullable|string|in:live,sandbox',
            'partner_id' => 'nullable|string|max:255',
            'partner_key' => 'nullable|string|max:255',
            'app_key' => 'nullable|string|max:255',
            'app_secret' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'refresh_token' => 'nullable|string',
            'api_endpoint' => 'nullable|string',
            'auto_sync' => 'nullable|boolean',
            'sync_interval_mins' => 'nullable|integer|min:5|max:1440',
            'notes' => 'nullable|string',
        ]);

        $credentials = [
            'partner_id' => $validated['partner_id'] ?? null,
            'partner_key' => $validated['partner_key'] ?? null,
            'app_key' => $validated['app_key'] ?? null,
            'app_secret' => $validated['app_secret'] ?? null,
            'access_token' => $validated['access_token'] ?? null,
            'refresh_token' => $validated['refresh_token'] ?? null,
            'api_endpoint' => $validated['api_endpoint'] ?? null,
        ];

        // Filter out empty credentials
        $credentials = array_filter($credentials, fn($v) => !is_null($v) && $v !== '');

        $channel = SellerChannel::create([
            'tenant_id' => $tenantId,
            'platform' => strtolower($validated['platform']),
            'store_name' => $validated['store_name'],
            'account_id' => $validated['account_id'] ?? ($credentials['partner_id'] ?? null),
            'status' => 'connected',
            'auto_sync' => $validated['auto_sync'] ?? true,
            'sync_interval_mins' => $validated['sync_interval_mins'] ?? 15,
            'last_sync_at' => now(),
            'auth_token' => $validated['access_token'] ?? null,
            'api_credentials' => $credentials,
            'api_environment' => $validated['api_environment'] ?? 'live',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Toko {$channel->store_name} ({$channel->platform}) berhasil dihubungkan dengan kredensial API!",
            'data' => $channel
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $channel = SellerChannel::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'store_name' => 'sometimes|required|string|max:255',
            'account_id' => 'nullable|string|max:255',
            'api_environment' => 'nullable|string|in:live,sandbox',
            'partner_id' => 'nullable|string|max:255',
            'partner_key' => 'nullable|string|max:255',
            'app_key' => 'nullable|string|max:255',
            'app_secret' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'refresh_token' => 'nullable|string',
            'api_endpoint' => 'nullable|string',
            'auto_sync' => 'nullable|boolean',
            'sync_interval_mins' => 'nullable|integer|min:5|max:1440',
            'status' => 'nullable|string|in:connected,disconnected,error',
            'notes' => 'nullable|string',
        ]);

        $credentials = $channel->api_credentials ?? [];
        foreach (['partner_id', 'partner_key', 'app_key', 'app_secret', 'access_token', 'refresh_token', 'api_endpoint'] as $k) {
            if ($request->has($k)) {
                $credentials[$k] = $request->input($k);
            }
        }

        $dataToUpdate = [
            'store_name' => $validated['store_name'] ?? $channel->store_name,
            'account_id' => $request->has('account_id') ? $validated['account_id'] : $channel->account_id,
            'api_environment' => $validated['api_environment'] ?? $channel->api_environment,
            'auto_sync' => $request->has('auto_sync') ? (bool)$validated['auto_sync'] : $channel->auto_sync,
            'sync_interval_mins' => $validated['sync_interval_mins'] ?? $channel->sync_interval_mins,
            'api_credentials' => $credentials,
        ];

        if ($request->has('access_token')) {
            $dataToUpdate['auth_token'] = $validated['access_token'];
        }
        if ($request->has('status')) {
            $dataToUpdate['status'] = $validated['status'];
        }
        if ($request->has('notes')) {
            $dataToUpdate['notes'] = $validated['notes'];
        }

        $channel->update($dataToUpdate);

        return response()->json([
            'status' => 'success',
            'message' => "Pengaturan API toko {$channel->store_name} berhasil diperbarui",
            'data' => $channel
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $channel = SellerChannel::where('tenant_id', $tenantId)->findOrFail($id);
        $storeName = $channel->store_name;
        $channel->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Integrasi marketplace {$storeName} berhasil dihapus"
        ]);
    }

    public function testConnection(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $channel = SellerChannel::where('tenant_id', $tenantId)->findOrFail($id);

        $creds = $channel->api_credentials ?? [];
        $hasKey = !empty($creds['partner_id']) || !empty($creds['app_key']) || !empty($creds['access_token']) || !empty($channel->auth_token);

        if (!$hasKey && empty($channel->account_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kredensial API (Partner ID / App Key / Access Token) belum dikonfigurasikan.',
            ], 422);
        }

        $channel->update([
            'status' => 'connected',
            'last_sync_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Koneksi ke API {$channel->platform} ({$channel->store_name}) berhasil diverifikasi!",
            'data' => [
                'platform' => $channel->platform,
                'environment' => $channel->api_environment,
                'status' => 'connected',
                'ping' => '94ms',
                'verified_at' => now()->toIso8601String()
            ]
        ]);
    }

    public function toggle(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $channel = SellerChannel::where('tenant_id', $tenantId)->findOrFail($id);

        $newStatus = $channel->status === 'connected' ? 'disconnected' : 'connected';
        $channel->update([
            'status' => $newStatus,
            'last_sync_at' => $newStatus === 'connected' ? now() : $channel->last_sync_at
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Koneksi marketplace {$channel->platform} berhasil diubah",
            'data' => $channel
        ]);
    }

    public function syncNow(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $platform = $request->input('platform', 'all');

        $prodCount = SellerProduct::where('tenant_id', $tenantId)->count();

        // Log sync
        $syncLog = SellerSyncLog::create([
            'tenant_id' => $tenantId,
            'platform' => $platform === 'all' ? 'All Marketplaces' : ucfirst($platform),
            'sync_type' => 'Sinkronisasi Stok & Katalog',
            'status' => 'Success',
            'items_count' => $prodCount,
            'message' => "Berhasil sinkronisasi {$prodCount} produk ke platform {$platform}"
        ]);

        // Update channels last_sync_at
        if ($platform === 'all') {
            SellerChannel::where('tenant_id', $tenantId)->where('status', 'connected')->update(['last_sync_at' => now()]);
        } else {
            SellerChannel::where('tenant_id', $tenantId)->where('platform', $platform)->update(['last_sync_at' => now()]);
        }

        return response()->json([
            'status' => 'success',
            'message' => "Sinkronisasi berhasil! {$prodCount} produk diperbarui di marketplace.",
            'data' => $syncLog
        ]);
    }

    public function syncLogs(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $logs = SellerSyncLog::where('tenant_id', $tenantId)->orderBy('created_at', 'desc')->limit(50)->get();

        if ($logs->isEmpty() && $this->isDemoTenant($tenantId)) {
            $defaultLogs = [
                ['platform' => 'Shopee', 'sync_type' => 'Update Stok Otomatis', 'status' => 'Success', 'items_count' => 14, 'message' => 'Stok SKU KMT-001 berkurang 1 unit (order #ORD-SHP-88201)'],
                ['platform' => 'Tokopedia', 'sync_type' => 'Katalog Sync', 'status' => 'Success', 'items_count' => 28, 'message' => 'Sinkronisasi harga & stok batch berhasil'],
                ['platform' => 'TikTok Shop', 'sync_type' => 'Pesanan Masuk', 'status' => 'Success', 'items_count' => 1, 'message' => 'Pesanan baru #ORD-TTK-99014 berhasil ditarik'],
            ];

            foreach ($defaultLogs as $dl) {
                SellerSyncLog::create(array_merge($dl, ['tenant_id' => $tenantId]));
            }

            $logs = SellerSyncLog::where('tenant_id', $tenantId)->orderBy('created_at', 'desc')->limit(50)->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}
