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
        $tenantId = $request->attributes->get('tenant_id');
        if (empty($tenantId)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Unauthorized: No Tenant context associated with this API key.',
                'error_code' => 'API_KEY_NO_TENANT'
            ], 403));
        }
        return $tenantId;
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

    // ─── JASA (SERVICES) EXTERNAL API ENDPOINTS ─────────────────────────────

    /**
     * 5. GET /api/v1/external/work-orders
     */
    public function getWorkOrders(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $query = \App\Models\JasaWorkOrder::where('tenant_id', $tenantId)->with('technician:id,name,specialty,phone');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('spk_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('equipment_name', 'like', "%{$search}%");
            });
        }

        $perPage = min(100, max(1, (int) ($request->per_page ?? 20)));
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'pagination' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ]
        ]);
    }

    /**
     * 6. POST /api/v1/external/work-orders
     */
    public function createWorkOrder(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_email' => 'nullable|email|max:100',
            'customer_company' => 'nullable|string|max:255',
            'customer_address' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'equipment_name' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:100',
            'priority' => 'nullable|string|in:Rendah,Sedang,Tinggi,Darurat',
            'service_description' => 'nullable|string',
            'scheduled_date' => 'nullable|date',
            'labor_rate' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $spkNumber = 'SPK-' . strtoupper(Str::random(8));

        $order = \App\Models\JasaWorkOrder::create([
            'tenant_id' => $tenantId,
            'spk_number' => $spkNumber,
            'title' => $request->title,
            'customer_name' => $request->customer_name,
            'customer_company' => $request->customer_company,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'customer_address' => $request->customer_address,
            'category' => $request->category ?? 'Perbaikan & Troubleshooting (Corrective)',
            'equipment_name' => $request->equipment_name ?? 'Unit / Perangkat Klien',
            'serial_number' => $request->serial_number,
            'priority' => $request->priority ?? 'Sedang',
            'status' => 'Antrean',
            'scheduled_date' => $request->scheduled_date ?? now()->toDateString(),
            'labor_rate' => $request->labor_rate ?? 0,
            'grand_total' => $request->labor_rate ?? 0,
            'service_description' => $request->service_description,
            'payment_status' => 'Belum Bayar',
        ]);

        // Dispatch Webhook to tenant
        $this->dispatchTenantWebhook($tenantId, 'spk.created', $order->toArray());

        return response()->json([
            'success' => true,
            'message' => "SPK {$spkNumber} berhasil diterbitkan via API!",
            'data' => $order
        ], 201);
    }

    /**
     * 7. GET /api/v1/external/work-orders/{id}
     */
    public function getWorkOrderDetail(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $order = \App\Models\JasaWorkOrder::where('tenant_id', $tenantId)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('spk_number', $id);
            })
            ->with(['technician:id,name,specialty,phone', 'parts', 'logs'])
            ->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Data SPK tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * 8. GET /api/v1/external/services
     */
    public function getServices(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $services = \App\Models\JasaServiceCatalog::where('tenant_id', $tenantId)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    /**
     * 9. GET /api/v1/external/technicians
     */
    public function getTechnicians(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $technicians = \App\Models\JasaTechnician::where('tenant_id', $tenantId)
            ->get(['id', 'name', 'specialty', 'phone', 'rating', 'current_status', 'completed_jobs']);

        return response()->json([
            'success' => true,
            'data' => $technicians
        ]);
    }
}
