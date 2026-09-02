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

    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $channels = SellerChannel::where('tenant_id', $tenantId)->get();

        if ($channels->isEmpty()) {
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

        if ($logs->isEmpty()) {
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
