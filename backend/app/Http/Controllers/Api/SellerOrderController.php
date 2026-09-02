<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellerOrder;
use App\Models\SellerProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerOrderController extends Controller
{
    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user ? ($user->tenant_id ?? 'TN-DEMO') : 'TN-DEMO';
    }

    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $query = SellerOrder::where('tenant_id', $tenantId);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('order_no', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('tracking_no', 'like', "%{$s}%");
            });
        }

        if ($request->filled('platform') && $request->platform !== 'all') {
            $query->where('platform', $request->platform);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('order_date', 'desc')->get();

        // Seed initial orders if empty
        if ($orders->isEmpty() && !$request->filled('search')) {
            $defaultOrders = [
                [
                    'order_no' => 'ORD-SHP-88201',
                    'platform' => 'shopee',
                    'customer_name' => 'Budi Santoso',
                    'customer_phone' => '081234567890',
                    'customer_address' => 'Jl. Merdeka No. 45, Jakarta Selatan',
                    'courier' => 'J&T Express',
                    'tracking_no' => 'JT9928172019',
                    'status' => 'Perlu Dikirim',
                    'total_amount' => 299000,
                    'shipping_cost' => 15000,
                    'payment_method' => 'ShopeePay',
                    'items' => [
                        ['sku' => 'SNK-002', 'name' => 'Sepatu Sneakers Running V2', 'qty' => 1, 'price' => 299000]
                    ],
                    'order_date' => now()->subHours(2),
                ],
                [
                    'order_no' => 'ORD-TKP-55102',
                    'platform' => 'tokopedia',
                    'customer_name' => 'Siti Nurhaliza',
                    'customer_phone' => '085712349988',
                    'customer_address' => 'Komplek Permata Hijau Blok C3, Bandung',
                    'courier' => 'SiCepat REG',
                    'tracking_no' => '00291882711',
                    'status' => 'Dikirim',
                    'total_amount' => 149000,
                    'shipping_cost' => 12000,
                    'payment_method' => 'GoPay',
                    'items' => [
                        ['sku' => 'KMT-001', 'name' => 'Kemeja Katun Polos Premium', 'qty' => 1, 'price' => 149000]
                    ],
                    'order_date' => now()->subDay(),
                ],
                [
                    'order_no' => 'ORD-TTK-99014',
                    'platform' => 'tiktok',
                    'customer_name' => 'Rian Pratama',
                    'customer_phone' => '087829104433',
                    'customer_address' => 'Jl. Sudirman Kav 12, Surabaya',
                    'courier' => 'JNE REG',
                    'tracking_no' => 'JNE001928374',
                    'status' => 'Selesai',
                    'total_amount' => 378000,
                    'shipping_cost' => 20000,
                    'payment_method' => 'TikTok Shop COD',
                    'items' => [
                        ['sku' => 'TAS-003', 'name' => 'Tas Ransel Anti Air Urban', 'qty' => 2, 'price' => 189000]
                    ],
                    'order_date' => now()->subDays(3),
                ]
            ];

            foreach ($defaultOrders as $dord) {
                SellerOrder::create(array_merge($dord, ['tenant_id' => $tenantId]));
            }

            $orders = SellerOrder::where('tenant_id', $tenantId)->orderBy('order_date', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'order_no' => 'required|string|max:100',
            'platform' => 'required|string|max:50',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_address' => 'nullable|string',
            'courier' => 'nullable|string|max:100',
            'tracking_no' => 'nullable|string|max:100',
            'status' => 'nullable|string',
            'total_amount' => 'required|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'items' => 'required|array',
            'notes' => 'nullable|string'
        ]);

        $validated['tenant_id'] = $tenantId;
        $validated['status'] = $validated['status'] ?? 'Perlu Dikirim';
        $validated['order_date'] = now();

        $order = DB::transaction(function () use ($validated, $tenantId) {
            $createdOrder = SellerOrder::create($validated);

            // Deduct stock for items
            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    if (isset($item['sku'])) {
                        $p = SellerProduct::where('tenant_id', $tenantId)->where('sku', $item['sku'])->first();
                        if ($p) {
                            $qty = intval($item['qty'] ?? 1);
                            $newStock = max(0, $p->stock - $qty);
                            $p->update([
                                'stock' => $newStock,
                                'status' => $newStock <= 0 ? 'Habis' : ($newStock <= $p->min_stock ? 'Menipis' : 'Aktif')
                            ]);
                        }
                    }
                }
            }

            return $createdOrder;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Pesanan berhasil dibuat',
            'data' => $order
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $order = SellerOrder::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string',
            'tracking_no' => 'nullable|string',
            'courier' => 'nullable|string'
        ]);

        $order->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order
        ]);
    }
}
