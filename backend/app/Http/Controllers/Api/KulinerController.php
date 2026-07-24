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
use App\Services\Kuliner\RecipeService;
use App\Services\Kuliner\OrderStatusService;
use App\Services\Kuliner\ReportService;
use App\Services\Notifications\WhatsAppNotifierInterface;
use App\Models\KulinerIngredient;
use App\Models\User;
use App\Models\KulinerPromo;
use App\Models\KulinerRole;
use App\Models\KulinerExpense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class KulinerController extends Controller
{
    protected TransactionService $transactionService;
    protected RecipeService $recipeService;
    protected OrderStatusService $orderStatusService;
    protected ReportService $reportService;
    protected WhatsAppNotifierInterface $whatsApp;

    public function __construct(TransactionService $transactionService, RecipeService $recipeService, OrderStatusService $orderStatusService, ReportService $reportService, WhatsAppNotifierInterface $whatsApp)
    {
        $this->transactionService = $transactionService;
        $this->recipeService = $recipeService;
        $this->orderStatusService = $orderStatusService;
        $this->reportService = $reportService;
        $this->whatsApp = $whatsApp;
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
            'store_name' => optional($settings)->store_name ?? $tenant->name,
            'address' => optional($settings)->address ?? $tenant->address ?? 'Alamat belum diatur',
            'phone' => optional($settings)->phone ?? $tenant->phone,
            'tenant_id' => $tenant->tenant_id,
            'operational_days' => optional($settings)->operational_days ?? 'Senin - Minggu',
            'opening_hours' => optional($settings)->opening_hours ?? '08:00 - 22:00',
            'hero_title' => optional($settings)->hero_title ?? 'Menu Lezat Kami',
            'hero_subtitle' => optional($settings)->hero_subtitle ?? 'Selamat datang di toko kami.',
            'hero_image_url' => optional($settings)->hero_image_url ?? null,
            'promo_title' => optional($settings)->promo_title ?? null,
            'promo_desc' => optional($settings)->promo_desc ?? null,
            'instagram_url' => optional($settings)->instagram_url ?? null,
            'whatsapp_number' => optional($settings)->whatsapp_number ?? null,
            'logo_url' => optional($settings)->logo_url ?? null,
            'website_url' => optional($settings)->website_url ?? null,
            'total_tables' => optional($settings)->total_tables ?? 0,
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
                $subtotal = 0;
                $orderItems = [];

                foreach ($request->items as $itemData) {
                    $product = KulinerProduct::withoutGlobalScopes()->find($itemData['id']);

                    if (!$product) {
                        $price = (float) ($itemData['price'] ?? 0);
                    } else {
                        $price = (float) ($product->discount_price ?: $product->price);
                    }

                    $qty = (float) ($itemData['quantity'] ?? 1);
                    $lineSubtotal = $price * $qty;
                    $subtotal += $lineSubtotal;

                    $orderItems[] = [
                        'product_id' => $product->id ?? null,
                        'kuliner_product_id' => $product->id ?? null,
                        'name' => $itemData['name'],
                        'qty' => $qty,
                        'price' => $price,
                        'subtotal' => $lineSubtotal
                    ];
                }

                // Service fee shown to the customer on the storefront cart (FullMenu.jsx)
                $serviceFee = 2000;

                // Re-validate the promo server-side instead of trusting the client's
                // discount_amount/total — a customer could otherwise apply an expired,
                // exhausted, or invalid code and still get charged the discounted price.
                $promo = null;
                $discountAmount = 0;
                if ($request->filled('promo_code')) {
                    $candidate = KulinerPromo::where('tenant_id', $tenantId)
                        ->where('code', strtoupper($request->promo_code))
                        ->where('status', 'active')
                        ->first();

                    $promoValid = $candidate
                        && (!$candidate->expired_at || !$candidate->expired_at->isPast())
                        && (!$candidate->quota || $candidate->used_count < $candidate->quota);

                    if ($promoValid) {
                        $promo = $candidate;
                        if ($promo->type === 'discount') {
                            $percent = (float) preg_replace('/\D/', '', $promo->value);
                            $discountAmount = round($subtotal * $percent / 100);
                        } elseif ($promo->type === 'nominal') {
                            $amount = (float) preg_replace('/\D/', '', $promo->value);
                            $discountAmount = min($amount, $subtotal);
                        }
                    }
                }

                $total = $subtotal + $serviceFee - $discountAmount;

                // 1. Save order
                $orderNumber = 'ORD-' . strtoupper(substr(uniqid(), -6));
                $source = $request->input('source', 'pos');
                $initialStatus = $request->is_staff_order ? 'processing' : ($source === 'qr_selforder' ? 'waiting' : 'pending');
                $notes = $request->notes;
                if ($promo) {
                    $promoNote = "Promo {$promo->code} (-Rp " . number_format($discountAmount, 0, ',', '.') . ")";
                    $notes = $notes ? "{$notes} | {$promoNote}" : $promoNote;
                }

                $order = Order::withoutGlobalScopes()->create([
                    'tenant_id' => $tenantId,
                    'order_number' => $orderNumber,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->customer_phone,
                    'order_type' => $request->order_type,
                    'table_number' => $request->table_number,
                    'payment_method' => $request->payment_method,
                    'notes' => $notes,
                    'source' => $source,
                    'total' => $total,
                    'status' => $initialStatus
                ]);

                // 2. Save order items
                foreach ($orderItems as $item) {
                    DB::table('order_items')->insert(array_merge($item, [
                        'order_id' => $order->id,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]));
                }

                if ($promo) {
                    $promo->increment('used_count');
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

                // 4. WhatsApp notification (best-effort, never blocks order creation)
                if ($request->customer_phone) {
                    try {
                        $this->whatsApp->send(
                            $request->customer_phone,
                            "Halo {$request->customer_name}, pesanan Anda #{$orderNumber} sudah kami terima dan akan segera diproses. Total: Rp " . number_format($total, 0, ',', '.')
                        );
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning('WhatsApp notify (order placed) failed: ' . $e->getMessage());
                    }
                }

                return response()->json([
                    'message' => 'Pesanan berhasil dibuat',
                    'order_number' => $orderNumber,
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
            $tenantId = auth()->user()->tenant_id;
            if (!$tenantId) {
                return response()->json(['message' => 'Akun Anda belum memiliki tenant yang valid.'], 403);
            }
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
        $products = KulinerProduct::with(['category', 'modifierGroups', 'addons'])
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

        $tenantId = auth()->user()->tenant_id;
        if (!$tenantId) {
            return response()->json(['message' => 'Akun Anda belum memiliki tenant yang valid.'], 403);
        }
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
            ->with('kulinerRole')
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
            'kuliner_role_id' => 'nullable|exists:kuliner_roles,id'
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
            'business_category_id' => auth()->user()->business_category_id,
            'kuliner_role_id' => $request->kuliner_role_id
        ]);

        return response()->json(['message' => 'Staff berhasil ditambahkan', 'data' => $user], 201);
    }

    /**
     * Admin: PUT /api/kuliner/admin/staff/{id}
     */
    public function updateStaff(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:cashier,chef,staff',
            'kuliner_role_id' => 'nullable|exists:kuliner_roles,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = auth()->user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);
        
        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'phone' => $request->phone,
            'kuliner_role_id' => $request->kuliner_role_id
        ];

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json(['message' => 'Data staff berhasil diperbarui', 'data' => $user]);
    }

    public function getRoles()
    {
        $tenantId = auth()->user()->tenant_id;
        return response()->json(KulinerRole::where('tenant_id', $tenantId)->get());
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array'
        ]);

        $role = KulinerRole::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $request->name,
            'permissions' => $request->permissions
        ]);

        return response()->json($role, 201);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array'
        ]);

        $role = KulinerRole::where('tenant_id', auth()->user()->tenant_id)->findOrFail($id);
        $role->update($request->only('name', 'permissions'));

        return response()->json($role);
    }

    public function destroyRole($id)
    {
        $role = KulinerRole::where('tenant_id', auth()->user()->tenant_id)->findOrFail($id);
        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus']);
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
            'store_name' => optional($settings)->store_name ?? $tenant->name,
            'address' => optional($settings)->address ?? $tenant->address,
            'phone' => optional($settings)->phone ?? $tenant->phone,
            'tenant_id' => $tenant->tenant_id,
            'opening_hours' => optional($settings)->opening_hours ?? '08:00 - 22:00',
            'operational_days' => optional($settings)->operational_days ?? 'Senin - Minggu',
            'total_tables' => optional($settings)->total_tables ?? 0,
            'hero_title' => optional($settings)->hero_title ?? 'Menu Lezat Kami',
            'hero_subtitle' => optional($settings)->hero_subtitle ?? 'Selamat datang di toko kami.',
            'hero_image_url' => optional($settings)->hero_image_url ?? '',
            'promo_title' => optional($settings)->promo_title ?? '',
            'promo_desc' => optional($settings)->promo_desc ?? '',
            'instagram_url' => optional($settings)->instagram_url ?? '',
            'whatsapp_number' => optional($settings)->whatsapp_number ?? '',
            'logo_url' => optional($settings)->logo_url ?? '',
            'website_url' => optional($settings)->website_url ?? '',
            'dine_in_enabled' => (bool) (optional($settings)->dine_in_enabled ?? false),
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
                    'hero_image_url' => $request->hero_image_url,
                    'promo_title' => $request->promo_title,
                    'promo_desc' => $request->promo_desc,
                    'instagram_url' => $request->instagram_url,
                    'whatsapp_number' => $request->whatsapp_number,
                    'logo_url' => $request->logo_url,
                    'website_url' => $request->website_url,
                    'dine_in_enabled' => $request->boolean('dine_in_enabled'),
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
            ->limit(1000)
            ->get();
        return response()->json($orders);
    }

    /**
     * Admin: GET /api/kuliner/admin/ledger
     */
    public function getLedger()
    {
        $tenantId = auth()->user()->tenant_id;
        
        // Ambil orders (income)
        $orders = Order::where('tenant_id', $tenantId)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($order) {
                // Formatting for unified ledger
                return [
                    'id' => 'ORD-' . $order->id,
                    'original_id' => $order->id,
                    'type' => 'income',
                    'date' => $order->created_at,
                    'category' => 'Penjualan',
                    'description' => 'Pesanan: ' . $order->customer_name,
                    'amount' => $order->total,
                    'status' => $order->status,
                    'raw_data' => $order
                ];
            });

        // Ambil expenses
        $expenses = KulinerExpense::where('tenant_id', $tenantId)
            ->orderBy('date', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => 'EXP-' . $expense->id,
                    'original_id' => $expense->id,
                    'type' => 'expense',
                    'date' => $expense->date . ' ' . $expense->created_at->format('H:i:s'), // Mocking datetime for sorting
                    'category' => $expense->category,
                    'description' => $expense->description,
                    'amount' => $expense->amount,
                    'status' => 'completed',
                    'raw_data' => $expense
                ];
            });

        // Gabungkan dan urutkan berdasarkan tanggal terbaru
        $ledger = $orders->concat($expenses)->sortByDesc('date')->values();
        
        return response()->json($ledger);
    }

    /**
     * Admin: POST /api/kuliner/admin/expenses
     */
    public function storeExpense(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;
        if (!$tenantId || $tenantId === 'TN-ADMIN') {
            return response()->json(['message' => 'Unauthorized: Invalid tenant context.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 400);
        }

        try {
            $expense = KulinerExpense::create([
                'tenant_id' => $tenantId,
                'date' => $request->date,
                'category' => $request->category,
                'description' => $request->description,
                'amount' => $request->amount
            ]);

            return response()->json(['message' => 'Pengeluaran berhasil dicatat', 'data' => $expense], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mencatat pengeluaran: ' . $e->getMessage()], 500);
        }
    }


    /**
     * Admin: PATCH /api/kuliner/admin/orders/{id}/status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $tenantId = auth()->user()->tenant_id;
        $order = Order::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,waiting,pending,cooking,processing,ready,served,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $order, $tenantId) {
            $oldStatus = $order->status;
            $newStatus = $request->status;

            $order = $this->orderStatusService->transition($order, $newStatus, $request->input('note'));

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
                $this->recipeService->consumeForOrder($order);
            }

            // WhatsApp notification on completion (best-effort, never blocks the status update)
            if ($newStatus === 'completed' && $oldStatus !== 'completed' && $order->customer_phone) {
                try {
                    $this->whatsApp->send(
                        $order->customer_phone,
                        "Halo {$order->customer_name}, pesanan Anda #{$order->order_number} telah selesai. Terima kasih telah memesan!"
                    );
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('WhatsApp notify (order completed) failed: ' . $e->getMessage());
                }
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

        $revenueYesterday = Order::where('tenant_id', $tenantId)
            ->whereDate('created_at', now()->subDay()->toDateString())
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

        // Phase 4 additive widgets — computed defensively so a failure here never
        // breaks the existing stats the dashboard already relies on.
        $profitToday = 0;
        $topMenu = null;
        $lowStockIngredients = [];
        $kitchenQueueCount = 0;
        try {
            $profitToday = $this->reportService->profitLoss($tenantId, $today, $today)['net_profit'];
            $topSeller = $this->reportService->bestSellers($tenantId, now()->subDays(29)->toDateString(), $today, 1);
            $topMenu = $topSeller[0]->name ?? null;
            $lowStockIngredients = KulinerIngredient::where('tenant_id', $tenantId)
                ->whereColumn('stock', '<=', 'min_stock')
                ->limit(5)
                ->get(['id', 'name', 'stock', 'unit']);
            $kitchenQueueCount = Order::where('tenant_id', $tenantId)
                ->whereIn('status', ['pending', 'waiting', 'processing', 'cooking', 'ready'])
                ->count();
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'revenue_today' => $revenueToday,
            'revenue_yesterday' => $revenueYesterday,
            'orders_today' => $ordersToday,
            'revenue_month' => $revenueMonth,
            'total_orders' => $totalOrders,
            'recent_orders' => $recentOrders,
            'profit_today' => $profitToday,
            'top_menu' => $topMenu,
            'low_stock_ingredients' => $lowStockIngredients,
            'kitchen_queue_count' => $kitchenQueueCount,
        ]);
    }

    /**
     * Admin: GET /api/kuliner/admin/promos
     */
    public function getPromos()
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        $promos = KulinerPromo::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($promos);
    }

    /**
     * Admin: POST /api/kuliner/admin/promos
     */
    public function storePromo(Request $request)
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:kuliner_promos,code',
            'type' => 'required|in:discount,nominal,bundle',
            'value' => 'required|string',
            'quota' => 'nullable|integer',
            'expired_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $promo = KulinerPromo::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'value' => $request->value,
            'description' => $request->description,
            'quota' => $request->quota ?: 0,
            'expired_at' => $request->expired_at,
            'status' => 'active'
        ]);

        return response()->json(['message' => 'Promo berhasil dibuat', 'data' => $promo], 201);
    }

    /**
     * Admin: PUT /api/kuliner/admin/promos/{id}
     */
    public function updatePromo(Request $request, $id)
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        $promo = KulinerPromo::where('tenant_id', $tenantId)->findOrFail($id);

        $promo->update([
            'name' => $request->name,
            'type' => $request->type,
            'value' => $request->value,
            'description' => $request->description,
            'quota' => $request->quota,
            'expired_at' => $request->expired_at,
            'status' => $request->status ?? 'active'
        ]);

        return response()->json(['message' => 'Promo berhasil diperbarui', 'data' => $promo]);
    }

    /**
     * Admin: DELETE /api/kuliner/admin/promos/{id}
     */
    public function destroyPromo($id)
    {
        $tenantId = auth('sanctum')->user()?->tenant_id;
        $promo = KulinerPromo::where('tenant_id', $tenantId)->findOrFail($id);
        $promo->delete();
        return response()->json(['message' => 'Promo berhasil dihapus']);
    }

    /**
     * Public: POST /api/kuliner/public/validate-promo
     */
    public function validatePromo(Request $request)
    {
        $code = strtoupper($request->code);
        $tenantId = $request->tenant_id;

        $promo = KulinerPromo::where('tenant_id', $tenantId)
            ->where('code', $code)
            ->where('status', 'active')
            ->first();

        if (!$promo) {
            return response()->json(['message' => 'Kode promo tidak valid atau sudah tidak aktif.'], 404);
        }

        // Check Expiry
        if ($promo->expired_at && $promo->expired_at->isPast()) {
            return response()->json(['message' => 'Maaf, masa berlaku promo ini sudah habis.'], 422);
        }

        // Check Quota
        if ($promo->quota > 0 && $promo->used_count >= $promo->quota) {
            return response()->json(['message' => 'Maaf, kuota promo ini sudah habis.'], 422);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Promo berhasil dipasang! ✨',
            'data' => [
                'code' => $promo->code,
                'type' => $promo->type,
                'value' => $promo->value,
                'name' => $promo->name
            ]
        ]);
    }

    /**
     * POST /api/kuliner/admin/ai-insights
     */
    public function getAiInsights()
    {
        $tenantId = auth()->user()->tenant_id;

        // Fetch same analytics data to feed the "AI logic"
        // 1. Top Products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select('order_items.name', DB::raw('SUM(order_items.qty) as total_orders'))
            ->where('orders.tenant_id', $tenantId)
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('order_items.name')
            ->orderBy('total_orders', 'desc')
            ->limit(3)
            ->get();

        // 2. Peak Hours
        $peakHours = DB::table('orders')
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first(); // Get the single busiest hour

        // 3. Loyalty
        $totalCustomers = DB::table('orders')->where('tenant_id', $tenantId)->distinct('customer_phone')->count('customer_phone');
        $returningCustomers = DB::table('orders')
            ->where('tenant_id', $tenantId)
            ->select('customer_phone')
            ->groupBy('customer_phone')
            ->having(DB::raw('COUNT(*)'), '>', 1)
            ->get()
            ->count();
        $loyaltyRate = $totalCustomers > 0 ? round(($returningCustomers / $totalCustomers) * 100) : 0;

        // 4. Payment
        $favoriteMethod = DB::table('orders')
            ->select('payment_method', DB::raw('COUNT(*) as count'))
            ->where('tenant_id', $tenantId)
            ->groupBy('payment_method')
            ->orderBy('count', 'desc')
            ->first();
        $methodLabel = '-';
        if ($favoriteMethod) {
            $methodLabel = $favoriteMethod->payment_method === 'cash_cashier' ? 'Tunai (Cash)' : 'QRIS';
        }

        // Generate response sections
        $insights = [];

        // Heading / Summary
        if ($topProducts->isEmpty()) {
            return response()->json([
                'success' => true,
                'generated_at' => now()->toIso8601String(),
                'insights' => [
                    'summary' => "Analisis belum dapat dilakukan karena belum ada data transaksi yang cukup pada sistem.",
                    'recommendations' => [
                        "Mulai buat pesanan uji coba di POS Kasir atau Website Order untuk mengumpulkan data.",
                        "Pastikan menu dan kategori sudah terisi lengkap di halaman Manajemen Katalog."
                    ]
                ]
            ]);
        }

        // Top product analysis
        $bestSeller = $topProducts->first()->name;
        $itemsList = $topProducts->pluck('name')->implode(', ');
        
        $insights['product_insight'] = "Menu terpopuler Anda saat ini didominasi oleh **{$bestSeller}**, diikuti oleh {$itemsList}. Ini menunjukkan preferensi pelanggan yang kuat pada jenis hidangan ini.";
        
        // Peak hour analysis
        if ($peakHours) {
            $busyHour = sprintf('%02d:00', $peakHours->hour);
            $insights['time_insight'] = "Trafik transaksi tertinggi terdeteksi di sekitar jam **{$busyHour}**. Disarankan untuk mengoptimalkan persiapan bahan baku (mise en place) sebelum jam sibuk ini guna meminimalkan waktu tunggu pelanggan.";
        } else {
            $insights['time_insight'] = "Pola kunjungan harian masih menyebar merata tanpa lonjakan trafik yang signifikan pada jam tertentu.";
        }

        // Loyalty rate analysis
        if ($loyaltyRate > 30) {
            $insights['loyalty_insight'] = "Rasio retensi pelanggan Anda sebesar **{$loyaltyRate}%** tergolong **Sangat Baik** untuk industri F&B. Pelanggan Anda menyukai rasa hidangan atau pelayanan Anda dan cenderung datang kembali.";
        } else {
            $insights['loyalty_insight'] = "Rasio retensi pelanggan Anda sebesar **{$loyaltyRate}%**. Rekomendasikan program loyalitas seperti stamp card digital atau diskon khusus kunjungan berikutnya untuk meningkatkan kedatangan berulang.";
        }

        // Payment analysis
        if ($methodLabel === 'QRIS') {
            $insights['payment_insight'] = "Pelanggan Anda lebih menyukai metode pembayaran digital (**QRIS**). Keuntungannya adalah pencatatan kas lebih akurat dan antrean kasir lebih cepat terurai.";
        } else {
            $insights['payment_insight'] = "Pembayaran tunai (**Tunai**) mendominasi transaksi. Pertimbangkan untuk menyediakan QRIS dinamis untuk mengurangi risiko uang kembalian dan mempercepat rekonsiliasi harian.";
        }

        // Recommendations list
        $recommendations = [
            "Buat paket bundling promo menyandingkan menu terlaris (**{$bestSeller}**) dengan minuman segar untuk menaikkan average basket size.",
            "Berikan promo happy hour/diskon khusus pada jam sepi pengunjung untuk meratakan distribusi kedatangan pelanggan.",
            "Pertahankan standar rasa dan kecepatan penyajian pada jam sibuk guna menjaga rasio loyalitas pelanggan Anda yang berharga."
        ];

        return response()->json([
            'success' => true,
            'generated_at' => now()->toIso8601String(),
            'insights' => [
                'summary' => "Berdasarkan performa transaksi 30 hari terakhir, bisnis kuliner Anda menunjukkan tren yang stabil dengan potensi pertumbuhan yang bisa dimaksimalkan melalui beberapa langkah taktis.",
                'details' => $insights,
                'recommendations' => $recommendations
            ]
        ]);
    }
}
