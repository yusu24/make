<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Product;
use App\Models\Order;
use App\Models\KulinerCategory;
use App\Models\KulinerProduct;
use App\Models\KulinerSetting;
use App\Models\KulinerTestimonial;
use App\Services\TransactionService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class KulinerController extends Controller
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    /**
     * GET /api/storefront/{slug}
     * Assuming slug corresponds to tenant_id for now, or we can use a custom slug field.
     */
    public function storefront(string $slug)
    {
        $tenant = Tenant::where('tenant_id', $slug)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Toko tidak ditemukan'], 404);
        }

        // Get products for this tenant
        $products = Product::where('tenant_id', $tenant->tenant_id)->get();

        return response()->json([
            'store' => [
                'name' => $tenant->name,
                'type' => $tenant->type,
            ],
            'products' => $products
        ]);
    }

    /**
     * GET /api/kuliner/public/settings
     */
    public function getBestSellers(Request $request)
    {
        $tenantId = $request->query('tenant_id') ?: $request->header('X-Tenant-ID');
        if (!$tenantId) return response()->json(['monthly' => null, 'daily_food' => null, 'daily_drink' => null]);

        // 1. Monthly Featured
        $monthlyTopId = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.tenant_id', $tenantId)
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select('product_id', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->first();

        $monthlyTop = $monthlyTopId 
            ? DB::table('kuliner_products')->where('id', $monthlyTopId->product_id)->first()
            : DB::table('kuliner_products')->where('tenant_id', $tenantId)->inRandomOrder()->first();

        // 2. Daily Best Sellers
        $dailyIds = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.tenant_id', $tenantId)
            ->whereDate('orders.created_at', now()->toDateString())
            ->select('product_id', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->get();

        $dailyFood = null;
        $dailyDrink = null;

        if ($dailyIds->isNotEmpty()) {
            $productIds = $dailyIds->pluck('product_id');
            // Fetch products with their category names separately
            $products = DB::table('kuliner_products')
                ->whereIn('id', $productIds)
                ->get();

            foreach ($dailyIds as $di) {
                $p = $products->firstWhere('id', $di->product_id);
                if (!$p) continue;

                $cat = DB::table('kuliner_categories')->where('id', $p->category_id)->first();
                if (!$cat) continue;

                $catName = strtolower($cat->name);
                if (!$dailyFood && str_contains($catName, 'makan')) {
                    $dailyFood = $p;
                }
                if (!$dailyDrink && (str_contains($catName, 'minum') || str_contains($catName, 'munum'))) {
                    $dailyDrink = $p;
                }
                if ($dailyFood && $dailyDrink) break;
            }
        }

        // Fallbacks
        if (!$dailyFood) {
            $dailyFood = DB::table('kuliner_products')
                ->where('tenant_id', $tenantId)
                ->whereIn('category_id', function($q) {
                    $q->select('id')->from('kuliner_categories')->where('name', 'like', '%makanan%');
                })
                ->inRandomOrder()->first();
        }

        if (!$dailyDrink) {
            $dailyDrink = DB::table('kuliner_products')
                ->where('tenant_id', $tenantId)
                ->whereIn('category_id', function($q) {
                    $q->select('id')->from('kuliner_categories')->where('name', 'like', '%minum%')->orWhere('name', 'like', '%munum%');
                })
                ->inRandomOrder()->first();
        }

        return response()->json([
            'monthly' => $monthlyTop,
            'daily_food' => $dailyFood,
            'daily_drink' => $dailyDrink
        ]);
    }

    public function getSettings(Request $request)
    {
        $tenantId = $request->query('tenant_id') ?: $request->header('X-Tenant-ID');
        
        // Handle "undefined" string from frontend and prioritize authenticated user's tenant if available
        if ($tenantId === 'undefined' || !$tenantId) {
            $tenantId = auth('sanctum')->user()?->tenant_id;
        }

        $tenant = $tenantId ? Tenant::where('tenant_id', $tenantId)->first() : null;
        
        if (!$tenant) {
            $tenant = Tenant::where('type', 'kuliner')->first();
        }

        if (!$tenant) {
            return response()->json(['message' => 'Toko tidak ditemukan'], 404);
        }
        
        $settings = KulinerSetting::where('tenant_id', $tenant->tenant_id)->first();
        
        return response()->json([
            'store_name' => $settings->store_name ?? $tenant->name,
            'address' => $settings->address ?? $tenant->address ?? 'Alamat belum diatur',
            'phone' => $settings->phone ?? $tenant->phone,
            'tenant_id' => $tenant->tenant_id,
            'operational_days' => $settings->operational_days ?? 'Senin - Minggu',
            'opening_hours' => $settings->opening_hours ?? '08:00 - 22:00',
            'hero_title' => $settings->hero_title ?? 'Menu Lezat Kami',
            'hero_subtitle' => $settings->hero_subtitle ?? 'Selamat datang di toko kami.',
            'promo_title' => $settings->promo_title ?? null,
            'promo_desc' => $settings->promo_desc ?? null,
            'instagram_url' => $settings->instagram_url ?? null,
            'whatsapp_number' => $settings->whatsapp_number ?? null,
            'logo_url' => $settings->logo_url ?? null,
            'website_url' => $settings->website_url ?? null,
            'total_tables' => $settings->total_tables ?? 0,
        ]);
    }

    /**
     * GET /api/kuliner/public/categories
     */
    public function getPublicCategories(Request $request)
    {
        $tenantId = $request->query('tenant_id') ?: $request->header('X-Tenant-ID');
        
        if ($tenantId === 'undefined' || !$tenantId) {
            $tenantId = auth('sanctum')->user()?->tenant_id;
        }

        $tenant = $tenantId ? Tenant::where('tenant_id', $tenantId)->first() : null;
        if (!$tenant) {
            $tenant = Tenant::where('type', 'kuliner')->first();
        }
        
        if (!$tenant) return response()->json([], 200);

        $categories = KulinerCategory::where('tenant_id', $tenant->tenant_id)->get();
        return response()->json($categories);
    }

    /**
     * GET /api/kuliner/public/products
     */
    public function getPublicProducts(Request $request)
    {
        $tenantId = $request->query('tenant_id') ?: $request->header('X-Tenant-ID');
        
        if ($tenantId === 'undefined' || !$tenantId) {
            $tenantId = auth('sanctum')->user()?->tenant_id;
        }

        $tenant = $tenantId ? Tenant::where('tenant_id', $tenantId)->first() : null;
        if (!$tenant) {
            $tenant = Tenant::where('type', 'kuliner')->first();
        }
        
        if (!$tenant) return response()->json([], 200);

        $products = KulinerProduct::where('tenant_id', $tenant->tenant_id)
            ->where('is_available', true)
            ->get();
        return response()->json($products);
    }

    /**
     * POST /api/kuliner/public/orders
     */
    public function placeOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'items' => 'required|array|min:1',
            'order_type' => 'required|in:dine_in,take_away',
            'payment_method' => 'required',
            'items.*.id' => 'required',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Determine tenant - fallback to first culinary tenant if not specified
        $tenantId = $request->input('tenant_id') ?: ($request->header('X-Tenant-ID') ?: Tenant::where('type', 'kuliner')->first()?->tenant_id);
        
        if (!$tenantId) {
            return response()->json(['message' => 'Konfigurasi toko (Tenant) belum tersedia.'], 400);
        }

        return DB::transaction(function () use ($request, $tenantId) {
            try {
                $total = 0;
                $orderItems = [];

                foreach ($request->items as $itemData) {
                    $product = Product::find($itemData['id']);
                    
                    if (!$product) {
                        $price = (float) ($itemData['price'] ?? 0);
                    } else {
                        $price = (float) $product->price;
                    }

                    $qty = (float) ($itemData['quantity'] ?? 1);
                    $subtotal = $price * $qty;
                    $total += $subtotal;

                    $orderItems[] = [
                        'product_id' => $product->id ?? null,
                        'name' => $itemData['name'],
                        'qty' => $qty,
                        'price' => $price,
                        'subtotal' => $subtotal
                    ];
                }

                // 1. Save order
                $order = Order::create([
                    'tenant_id' => $tenantId,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->customer_phone,
                    'order_type' => $request->order_type,
                    'table_number' => $request->table_number,
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                    'total' => $total,
                    'status' => $request->is_staff_order ? 'processing' : 'pending'
                ]);

                // 2. Save order items
                foreach ($orderItems as $item) {
                    DB::table('order_items')->insert(array_merge($item, [
                        'order_id' => $order->id,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]));
                }

                // 3. If staff order, record income immediately
                if ($request->is_staff_order) {
                    $this->transactionService->createTransaction([
                        'tenant_id' => $tenantId,
                        'type' => 'income',
                        'source' => 'cashier_order',
                        'reference_id' => $order->id,
                        'amount' => $total,
                        'description' => "Pesanan Kasir: {$request->customer_name} (Order #{$order->id})",
                    ]);
                }

                return response()->json([
                    'message' => 'Pesanan berhasil dibuat',
                    'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -5)),
                    'id' => $order->id
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Gagal memproses pesanan: ' . $e->getMessage(),
                    'error_trace' => $e->getTraceAsString()
                ], 500);
            }
        });
    }

    /**
     * Admin: GET /api/kuliner/admin/categories
     */
    public function getCategories()
    {
        $tenantId = auth()->user()->tenant_id;
        $categories = KulinerCategory::where('tenant_id', $tenantId)->get();
        return response()->json($categories);
    }

    /**
     * Admin: POST /api/kuliner/admin/categories
     */
    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $tenantId = auth()->user()->tenant_id ?: 'TN-ADMIN'; // Fallback if user tenant_id is missing
            $category = KulinerCategory::create([
                'tenant_id' => $tenantId,
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'image_url' => $request->image_url ?? '📁',
            ]);

            return response()->json(['message' => 'Kategori berhasil dibuat', 'data' => $category], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat kategori: ' . $e->getMessage(),
                'error_detail' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Admin: GET /api/kuliner/admin/products
     */
    public function getProducts()
    {
        $tenantId = auth()->user()->tenant_id;
        $products = KulinerProduct::with('category')
            ->where('tenant_id', $tenantId)
            ->get();
        return response()->json($products);
    }

    /**
     * Admin: POST /api/kuliner/admin/products
     */
    public function storeProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:kuliner_categories,id',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = auth()->user()->tenant_id ?: 'TN-ADMIN';
        $product = KulinerProduct::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'discount_price' => $request->discount_price,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'is_available' => true,
        ]);

        return response()->json(['message' => 'Menu berhasil dibuat', 'data' => $product], 201);
    }

    /**
     * Admin: DELETE /api/kuliner/admin/categories/{id}
     */
    public function destroyCategory($id)
    {
        $tenantId = auth()->user()->tenant_id;
        $category = KulinerCategory::where('tenant_id', $tenantId)->findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }

    /**
     * Admin: PUT /api/kuliner/admin/categories/{id}
     */
    public function updateCategory(Request $request, $id)
    {
        $tenantId = auth()->user()->tenant_id;
        $category = KulinerCategory::where('tenant_id', $tenantId)->findOrFail($id);
        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'image_url' => $request->image_url,
        ]);
        return response()->json(['message' => 'Kategori berhasil diperbarui', 'data' => $category]);
    }

    /**
     * Admin: PUT /api/kuliner/admin/products/{id}
     */
    public function updateProduct(Request $request, $id)
    {
        $tenantId = auth()->user()->tenant_id;
        $product = KulinerProduct::where('tenant_id', $tenantId)->findOrFail($id);
        $product->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'discount_price' => $request->discount_price,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'is_available' => $request->is_available,
        ]);
        return response()->json(['message' => 'Menu berhasil diperbarui', 'data' => $product]);
    }

    /**
     * Admin: DELETE /api/kuliner/admin/products/{id}
     */
    public function destroyProduct($id)
    {
        $tenantId = auth()->user()->tenant_id;
        $product = KulinerProduct::where('tenant_id', $tenantId)->findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Menu berhasil dihapus']);
    }

    /**
     * Admin: GET /api/kuliner/admin/staff
     */
    public function getStaff()
    {
        $tenantId = auth()->user()->tenant_id;
        $staff = User::where('tenant_id', $tenantId)
            ->whereIn('role', ['cashier', 'chef', 'staff'])
            ->get();
        return response()->json($staff);
    }

    /**
     * Admin: POST /api/kuliner/admin/staff
     */
    public function storeStaff(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:cashier,chef,staff',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = auth()->user()->tenant_id;
        $user = User::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'status' => 'active',
            'business_category_id' => auth()->user()->business_category_id
        ]);

        return response()->json(['message' => 'Staff berhasil ditambahkan', 'data' => $user], 201);
    }

    /**
     * Admin: PUT /api/kuliner/admin/staff/{id}
     */
    public function updateStaff(Request $request, $id)
    {
        $tenantId = auth()->user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);
        
        $data = [
            'name' => $request->name,
            'role' => $request->role,
            'phone' => $request->phone,
        ];

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json(['message' => 'Data staff berhasil diperbarui', 'data' => $user]);
    }

    /**
     * Admin: DELETE /api/kuliner/admin/staff/{id}
     */
    public function destroyStaff($id)
    {
        $tenantId = auth()->user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Staff berhasil dihapus']);
    }
    /**
     * Admin: GET /api/kuliner/admin/settings
     */
    public function getAdminSettings()
    {
        $tenantId = auth()->user()->tenant_id;
        $tenant = Tenant::where('tenant_id', $tenantId)->first();
        
        if (!$tenant) return response()->json(['message' => 'Tenant tidak ditemukan'], 404);

        $settings = KulinerSetting::where('tenant_id', $tenantId)->first();

        return response()->json([
            'store_name' => $settings->store_name ?? $tenant->name,
            'address' => $settings->address ?? $tenant->address,
            'phone' => $settings->phone ?? $tenant->phone,
            'tenant_id' => $tenant->tenant_id,
            'opening_hours' => $settings->opening_hours ?? '08:00 - 22:00',
            'operational_days' => $settings->operational_days ?? 'Senin - Minggu',
            'total_tables' => $settings->total_tables ?? 0,
            'hero_title' => $settings->hero_title ?? 'Menu Lezat Kami',
            'hero_subtitle' => $settings->hero_subtitle ?? 'Selamat datang di toko kami.',
            'promo_title' => $settings->promo_title ?? '',
            'promo_desc' => $settings->promo_desc ?? '',
            'instagram_url' => $settings->instagram_url ?? '',
            'whatsapp_number' => $settings->whatsapp_number ?? '',
            'logo_url' => $settings->logo_url ?? '',
            'website_url' => $settings->website_url ?? '',
        ]);
    }

    /**
     * Admin: POST /api/kuliner/admin/settings
     */
    public function updateAdminSettings(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;
        $tenant = Tenant::where('tenant_id', $tenantId)->first();
        
        if (!$tenant) return response()->json(['message' => 'Tenant tidak ditemukan'], 404);

        $validator = Validator::make($request->all(), [
            'store_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update main tenant info (basic name)
            $tenant->update([
                'name' => $request->store_name,
                'business_name' => $request->store_name,
            ]);

            // Update or Create Kuliner Specific Settings
            $settings = KulinerSetting::updateOrCreate(
                ['tenant_id' => $tenantId],
                [
                    'store_name' => $request->store_name,
                    'address' => $request->address,
                    'phone' => $request->phone,
                    'opening_hours' => $request->opening_hours,
                    'operational_days' => $request->operational_days,
                    'total_tables' => $request->total_tables,
                    'hero_title' => $request->hero_title,
                    'hero_subtitle' => $request->hero_subtitle,
                    'promo_title' => $request->promo_title,
                    'promo_desc' => $request->promo_desc,
                    'instagram_url' => $request->instagram_url,
                    'whatsapp_number' => $request->whatsapp_number,
                    'logo_url' => $request->logo_url,
                    'website_url' => $request->website_url,
                ]
            );

            return response()->json(['message' => 'Pengaturan berhasil diperbarui', 'data' => $settings]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memperbarui pengaturan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Admin: GET /api/kuliner/admin/orders
     */
    public function getOrders()
    {
        $tenantId = auth()->user()->tenant_id;
        $orders = Order::where('tenant_id', $tenantId)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($orders);
    }

    /**
     * Admin: PATCH /api/kuliner/admin/orders/{id}/status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $tenantId = auth()->user()->tenant_id;
        $order = Order::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $order, $tenantId) {
            $oldStatus = $order->status;
            $newStatus = $request->status;
            
            $order->update(['status' => $newStatus]);

            // If moving to 'processing' or 'completed' and was 'pending', record transaction if not already recorded
            // (Note: staff orders are recorded immediately in placeOrder)
            if (in_array($newStatus, ['processing', 'completed']) && $oldStatus === 'pending') {
                $this->transactionService->createTransaction([
                    'tenant_id' => $tenantId,
                    'type' => 'income',
                    'source' => 'cashier_order',
                    'reference_id' => $order->id,
                    'amount' => $order->total,
                    'description' => "Pesanan Selesai: {$order->customer_name} (Order #{$order->id})",
                ]);
            }

            return response()->json(['message' => 'Status pesanan berhasil diperbarui', 'data' => $order]);
        });
    }
    /**
     * Admin: GET /api/kuliner/admin/analytics
     */
    public function getAnalytics()
    {
        $tenantId = auth()->user()->tenant_id;

        // 1. Top 5 Products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select('order_items.name', DB::raw('SUM(order_items.qty) as total_orders'))
            ->where('orders.tenant_id', $tenantId)
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('order_items.name')
            ->orderBy('total_orders', 'desc')
            ->limit(5)
            ->get();

        $maxOrders = $topProducts->max('total_orders') ?: 1;
        $colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'];
        
        $formattedTopProducts = $topProducts->map(function($p, $idx) use ($maxOrders, $colors) {
            return [
                'name' => $p->name,
                'orders' => (int)$p->total_orders,
                'percentage' => round(($p->total_orders / $maxOrders) * 100),
                'color' => $colors[$idx % count($colors)]
            ];
        });

        // 2. Peak Hours (Last 30 days)
        $peakHours = DB::table('orders')
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('hour')
            ->orderBy('hour', 'asc')
            ->get();

        $hoursMap = [];
        foreach (range(0, 23) as $h) {
            $hoursMap[$h] = 0;
        }
        foreach ($peakHours as $ph) {
            $hoursMap[$ph->hour] = $ph->count;
        }

        $maxHourCount = $peakHours->max('count') ?: 1;
        $formattedPeakHours = [];
        foreach ($hoursMap as $h => $count) {
            $formattedPeakHours[] = [
                'hour' => sprintf('%02d:00', $h),
                'intensity' => round(($count / $maxHourCount) * 100)
            ];
        }

        // 3. Stats
        $favoriteMethod = DB::table('orders')
            ->select('payment_method', DB::raw('COUNT(*) as count'))
            ->where('tenant_id', $tenantId)
            ->groupBy('payment_method')
            ->orderBy('count', 'desc')
            ->first();

        $methodLabel = '-';
        if ($favoriteMethod) {
            $methodLabel = $favoriteMethod->payment_method === 'cash_cashier' ? 'Tunai' : 'QRIS';
        }

        // Simple loyalty rate based on returning phone numbers
        $totalCustomers = DB::table('orders')->where('tenant_id', $tenantId)->distinct('customer_phone')->count('customer_phone');
        $returningCustomers = DB::table('orders')
            ->where('tenant_id', $tenantId)
            ->select('customer_phone')
            ->groupBy('customer_phone')
            ->having(DB::raw('COUNT(*)'), '>', 1)
            ->get()
            ->count();
        
        $loyaltyRate = $totalCustomers > 0 ? round(($returningCustomers / $totalCustomers) * 100) : 0;

        return response()->json([
            'topProducts' => $formattedTopProducts,
            'peakHours' => $formattedPeakHours,
            'stats' => [
                'loyaltyRate' => $loyaltyRate,
                'favoriteMethod' => $methodLabel,
                'serviceRating' => 4.8 // Mock rating for now
            ]
        ]);
    }

    /**
     * GET /api/kuliner/public/testimonials
     */
    public function getPublicTestimonials(Request $request)
    {
        $tenantId = $request->query('tenant_id') ?: $request->header('X-Tenant-ID');
        
        if ($tenantId === 'undefined' || !$tenantId) {
            $tenantId = auth('sanctum')->user()?->tenant_id;
        }

        $tenant = $tenantId ? Tenant::where('tenant_id', $tenantId)->first() : null;
        if (!$tenant) {
            $tenant = Tenant::where('type', 'kuliner')->first();
        }
        
        if (!$tenant) return response()->json([], 200);

        $testimonials = KulinerTestimonial::where('tenant_id', $tenant->tenant_id)
            ->where('is_displayed', true)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($testimonials);
    }

    /**
     * POST /api/kuliner/public/testimonials
     */
    public function submitTestimonial(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'customer_role' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->input('tenant_id') ?: ($request->header('X-Tenant-ID') ?: Tenant::where('type', 'kuliner')->first()?->tenant_id);
        
        if (!$tenantId) {
            return response()->json(['message' => 'Konfigurasi toko tidak ditemukan.'], 400);
        }

        $testimonial = KulinerTestimonial::create([
            'tenant_id' => $tenantId,
            'customer_name' => $request->customer_name,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'customer_role' => $request->customer_role,
            'is_displayed' => false // Hidden by default, requires admin approval
        ]);

        return response()->json(['message' => 'Terima kasih atas testimoni Anda! ✨', 'data' => $testimonial], 201);
    }

    /**
     * GET /api/kuliner/admin/testimonials
     */
    public function getAdminTestimonials(Request $request)
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        if (!$tenantId) return response()->json([], 200);

        $testimonials = KulinerTestimonial::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($testimonials);
    }

    /**
     * PATCH /api/kuliner/admin/testimonials/{id}/status
     */
    public function updateTestimonialStatus(Request $request, $id)
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        $testimonial = KulinerTestimonial::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $testimonial->update([
            'is_displayed' => $request->is_displayed
        ]);

        return response()->json([
            'message' => 'Status testimoni berhasil diperbarui!',
            'data' => $testimonial
        ]);
    }

    public function getDashboardStats(Request $request)
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        if (!$tenantId) return response()->json(['message' => 'Tenant ID not found'], 401);

        $today = now()->toDateString();
        $thisMonth = now()->format('Y-m');

        // Stats
        $revenueToday = Order::where('tenant_id', $tenantId)
            ->whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');

        $ordersToday = Order::where('tenant_id', $tenantId)
            ->whereDate('created_at', $today)
            ->count();

        $revenueMonth = Order::where('tenant_id', $tenantId)
            ->where('created_at', 'like', "$thisMonth%")
            ->where('status', 'completed')
            ->sum('total');

        $totalOrders = Order::where('tenant_id', $tenantId)->count();

        // Recent Orders
        $recentOrders = Order::where('tenant_id', $tenantId)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number ?: '#' . $order->id,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'total_amount' => $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                ];
            });

        return response()->json([
            'revenue_today' => $revenueToday,
            'orders_today' => $ordersToday,
            'revenue_month' => $revenueMonth,
            'total_orders' => $totalOrders,
            'recent_orders' => $recentOrders
        ]);
    }
}
