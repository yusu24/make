<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ExternalApiController extends Controller
{
    protected function getTenantId(Request $request): string
    {
        return $request->attributes->get('tenant_id') ?? $request->header('X-Tenant-ID') ?? '';
    }

    /**
     * Dispatch webhook to tenant's active endpoints
     */
    protected function dispatchTenantWebhook(string $tenantId, string $event, array $data): void
    {
        try {
            $webhooks = Webhook::where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->get();

            $payload = [
                'event' => $event,
                'tenant_id' => $tenantId,
                'timestamp' => now()->toIso8601String(),
                'data' => $data,
            ];

            foreach ($webhooks as $wh) {
                // Check if webhook is listening to this event or all events
                $events = $wh->events ?? [];
                if (!empty($events) && !in_array($event, $events) && !in_array('*', $events)) {
                    continue;
                }

                $signature = hash_hmac('sha256', json_encode($payload), $wh->secret_key ?? 'secret');

                // Fire & forget HTTP call with short timeout
                try {
                    Http::timeout(3)
                        ->withHeaders([
                            'X-Bizora-Signature' => $signature,
                            'Content-Type' => 'application/json',
                            'User-Agent' => 'Bizora-Webhook-Dispatcher/2.0'
                        ])
                        ->post($wh->url, $payload);
                } catch (\Throwable $e) {
                    // silently log / ignore client endpoint failures
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }
    }

    /**
     * 1. GET /api/v1/external/profile
     */
    public function profile(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $tenant = Tenant::where('tenant_id', $tenantId)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'tenant_id' => $tenantId,
                'business_name' => $tenant->business_name ?? $tenant->name ?? 'Toko Bizora',
                'category' => $tenant->businessCategory?->name ?? $tenant->type ?? 'retail',
                'subscription_plan' => $tenant->subscription_plan ?? 'active',
                'status' => $tenant->status ?? 'active',
                'expires_at' => $tenant->subscription_expires_at?->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * 2. GET /api/v1/external/products
     */
    public function getProducts(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        
        $query = Product::where('tenant_id', $tenantId);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $perPage = min(100, max(1, (int) ($request->per_page ?? 20)));
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }

    /**
     * 3. POST /api/v1/external/orders
     */
    public function createOrder(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $tenantId) {
            $invoiceNumber = 'EXT-' . strtoupper(Str::random(10));
            $totalAmount = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $product = Product::where('tenant_id', $tenantId)->findOrFail($item['product_id']);
                $qty = (int) $item['quantity'];
                $price = (float) ($item['price'] ?? $product->price ?? $product->selling_price ?? 0);
                $subtotal = $price * $qty;
                $totalAmount += $subtotal;

                // Deduct stock
                if (isset($product->stock)) {
                    $product->decrement('stock', $qty);
                }

                $orderItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'price' => $price,
                    'quantity' => $qty,
                    'subtotal' => $subtotal,
                ];
            }

            $orderData = [
                'invoice_number' => $invoiceNumber,
                'total_amount' => $totalAmount,
                'payment_method' => $request->payment_method ?? 'ONLINE_API',
                'customer_name' => $request->customer_name ?? 'Pelanggan API Eksternal',
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'items' => $orderItems,
                'created_at' => now()->toIso8601String(),
            ];

            // Dispatch Webhook to tenant
            $this->dispatchTenantWebhook($tenantId, 'order.created', $orderData);
            $this->dispatchTenantWebhook($tenantId, 'payment.success', $orderData);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat & stok otomatis terpotong!',
                'data' => $orderData
            ], 201);
        });
    }

    /**
     * 4. GET /api/v1/external/stock
     */
    public function getStock(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        
        $products = Product::where('tenant_id', $tenantId)
            ->get(['id', 'name', 'sku', 'barcode', 'stock', 'price', 'updated_at']);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}
