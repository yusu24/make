<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                    => 'required|string|max:255',
            'email'                   => 'required|email|unique:users,email',
            'password'                => 'required|string|min:8|confirmed',
            'business_category_id'    => 'nullable|exists:business_categories,id',
            'phone'                   => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'role'                 => 'customer',
            'status'               => 'active',
            'business_category_id' => $request->business_category_id,
            'phone'                => $request->phone,
        ]);

        // Auto-create tenant if category provided
        if ($request->business_category_id) {
            $tenantId = 'TN-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);
            
            // Assign tenant_id to the created user
            $user->update(['tenant_id' => $tenantId]);

            $category = BusinessCategory::find($request->business_category_id);
            Tenant::create([
                'tenant_id'            => $tenantId,
                'user_id'              => $user->id,
                'business_category_id' => $request->business_category_id,
                'business_name'        => $user->name,
                'subscription_plan'    => 'free',
                'status'               => 'active',
                'trial_ends_at'        => now()->addDays(3),
            ]);
            // Auto-seed default data for Retail
            if ($category && $category->slug === 'toko-retail') {
                $this->seedDefaultRetailData($tenantId);
            }
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action'  => 'register',
            'target'  => 'User: ' . $user->name,
            'level'   => 'success',
            'ip_address' => $request->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data'    => [
                'token' => $token,
                'user'  => $this->formatUser($user),
            ],
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Data tidak lengkap', 'errors' => $validator->errors()], 422);
        }

        $user = User::with(['businessCategory', 'tenant', 'retailRole', 'kulinerRole'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email atau password salah'], 401);
        }

        if ($user->status === 'inactive') {
            return response()->json(['success' => false, 'message' => 'Akun Anda tidak aktif. Hubungi admin.'], 403);
        }

        // Create new token (keep existing tokens alive so other open tabs stay logged in)
        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLog::create([
            'user_id'    => $user->id,
            'action'     => 'login',
            'target'     => 'System',
            'level'      => 'info',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data'    => [
                'token' => $token,
                'user'  => $this->formatUser($user),
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $isDemo = str_starts_with($user->email, 'demo-kuliner-');

        $user->currentAccessToken()->delete();

        if ($isDemo) {
            $this->cleanupDemoTenant($user);
        }

        return response()->json(['success' => true, 'message' => 'Logout berhasil']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('businessCategory', 'tenant', 'retailRole', 'kulinerRole');
        return response()->json(['success' => true, 'data' => $this->formatUser($user)]);
    }

    /**
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $user->update($validator->validated());

        return response()->json(['success' => true, 'data' => $this->formatUser($user->fresh()->load('businessCategory', 'tenant'))]);
    }

    /**
     * PUT /api/auth/password
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Password saat ini salah.']]], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['success' => true, 'message' => 'Password berhasil diubah']);
    }

    private function formatUser(User $user): array
    {
        $tenant = $user->tenant;
        $plan = $tenant?->subscription_plan ?? 'free';
        
        $status = 'active';
        $daysLeft = 0;

        if ($plan === 'free' && $tenant) {
            $createdAt = $tenant->created_at;
            $diffInDays = $createdAt->diffInDays(now(), false); // Days since registration

            if ($diffInDays >= 5) {
                $status = 'locked';
            } elseif ($diffInDays >= 3) {
                $status = 'warning';
                $daysLeft = 5 - $diffInDays;
            }
        }

        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'role'              => $user->role,
            'tenant_id'         => $user->tenant_id,
            'tenant_name'       => $tenant?->business_name ?? $tenant?->name,
            'status'            => $user->status,
            'phone'             => $user->phone,
            'business_category' => $user->businessCategory?->name,
            'business_category_id' => $user->business_category_id,
            'subscription_plan' => $plan,
            'subscription_status' => $status,
            'subscription_days_left' => $daysLeft,
            'active_modules'    => $tenant ? $tenant->modules()->where('is_active', true)->pluck('name')->toArray() : [],
            'permissions'       => ($user->role === 'customer' || $user->role === 'super_admin') 
                                    ? 'all' 
                                    : ($user->retailRole ? $user->retailRole->permissions : ($user->kulinerRole ? $user->kulinerRole->permissions : [])),
        ];
    }

    private function seedDefaultRetailData(string $tenantId)
    {
        // 1. Categories
        $cats = ['Makanan', 'Minuman', 'Elektronik', 'Pakaian', 'Alat Kantor', 'Lainnya'];
        foreach ($cats as $c) {
            \App\Models\RetailCategory::create(['tenant_id' => $tenantId, 'name' => $c]);
        }

        // 2. Units
        $units = ['Pcs', 'Box', 'Pak', 'Botol', 'Kg', 'Liter', 'Meter'];
        foreach ($units as $u) {
            \App\Models\RetailUnit::create(['tenant_id' => $tenantId, 'name' => $u]);
        }

        // 3. Expense Categories
        $expCats = ['Gaji Pegawai', 'Sewa Tempat', 'Listrik & Air', 'Operasional', 'Pemasaran', 'Lain-lain'];
        foreach ($expCats as $ec) {
            \App\Models\RetailExpenseCategory::create(['tenant_id' => $tenantId, 'name' => $ec]);
        }

        // 4. Default settings (tax rate, loyalty points ratio)
        \App\Models\RetailSetting::create([
            'tenant_id' => $tenantId,
            'tax_rate' => 0,
            'points_ratio' => 10000,
        ]);

        // 5. Default staff role (kasir — POS + inventory view only)
        \App\Models\RetailRole::create([
            'tenant_id' => $tenantId,
            'name' => 'Kasir',
            'permissions' => ['pos', 'inventory'],
        ]);
    }

    /**
     * POST /api/auth/demo-sandbox
     */
    /**
     * POST /api/auth/demo-sandbox
     */
    public function createDemoSandbox(Request $request)
    {
        $categorySlug = $request->input('category', 'kuliner');
        
        // Normalize slug
        if ($categorySlug === 'budidaya') {
            $categorySlug = 'budidaya-ikan';
        } elseif ($categorySlug === 'tanaman') {
            $categorySlug = 'budidaya-tanaman';
        }

        $allowedSlugs = ['toko-retail', 'budidaya-ikan', 'budidaya-tanaman', 'kuliner'];
        if (!in_array($categorySlug, $allowedSlugs)) {
            return response()->json(['success' => false, 'message' => 'Kategori bisnis tidak didukung untuk demo sandbox.'], 400);
        }

        $category = BusinessCategory::where('slug', $categorySlug)->first();
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kategori bisnis tidak ditemukan.'], 404);
        }

        $rand = \Illuminate\Support\Str::random(8);
        $email = 'demo-sandbox-' . $rand . '@umkm-demo.com';
        $tenantId = 'TN-DS-' . strtoupper($rand);
        
        $namePrefixes = [
            'toko-retail'      => 'Demo Mart ',
            'budidaya-ikan'    => 'Demo Ikan ',
            'budidaya-tanaman' => 'Demo Tani ',
            'kuliner'          => 'Demo Resto ',
        ];
        $name = ($namePrefixes[$categorySlug] ?? 'Demo Usaha ') . strtoupper(substr($rand, 0, 4));

        $user = User::create([
            'name'                 => $name,
            'email'                => $email,
            'password'             => Hash::make('password'),
            'role'                 => 'customer',
            'status'               => 'active',
            'business_category_id' => $category->id,
            'phone'                => '081234567890',
            'tenant_id'            => $tenantId,
        ]);

        $tenant = Tenant::create([
            'tenant_id'            => $tenantId,
            'user_id'              => $user->id,
            'name'                 => $name,
            'business_category_id' => $category->id,
            'business_name'        => $name,
            'subscription_plan'    => 'free',
            'status'               => 'active',
        ]);

        // Attach all system modules as active for maximum demo exposure
        $modules = \Illuminate\Support\Facades\DB::table('modules')->get();
        foreach ($modules as $mod) {
            \Illuminate\Support\Facades\DB::table('business_modules')->updateOrInsert(
                ['tenant_id' => $tenantId, 'module_id' => $mod->id],
                ['is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // Call the corresponding seeder logic
        $seeder = new \Database\Seeders\DatabaseSeeder();
        if ($categorySlug === 'toko-retail') {
            $seeder->seedRetailData($tenantId);
        } elseif ($categorySlug === 'budidaya-ikan') {
            $seeder->seedBudidayaData($tenantId);
        } elseif ($categorySlug === 'budidaya-tanaman') {
            $seeder->seedTanamanData($tenantId);
        } elseif ($categorySlug === 'kuliner') {
            $this->seedDemoSandboxKulinerData($tenantId);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Demo Sandbox berhasil dibuat',
            'data'    => [
                'token' => $token,
                'user'  => $this->formatUser($user),
            ],
        ]);
    }

    public function cleanupOldDemoSandboxes()
    {
        try {
            $oldDemoUsers = User::where(function($q) {
                                    $q->where('email', 'like', 'demo-sandbox-%')
                                      ->orWhere('email', 'like', 'demo-kuliner-%');
                                })
                                ->where('created_at', '<', now()->subHours(2))
                                ->get();
                                
            foreach ($oldDemoUsers as $oldUser) {
                $this->cleanupDemoTenant($oldUser);
            }
        } catch (\Exception $e) {
            logger()->error('Demo sandbox cleanup failed: ' . $e->getMessage());
        }
    }

    private function cleanupDemoTenant($user)
    {
        $tenantId = $user->tenant_id;
        if (!$tenantId || (!str_starts_with($tenantId, 'TN-DS-') && !str_starts_with($tenantId, 'TN-DK-'))) {
            return;
        }

        // 1. Delete all dependent sub-items first
        $orderIds = \Illuminate\Support\Facades\DB::table('orders')->where('tenant_id', $tenantId)->pluck('id');
        if ($orderIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('order_items')->whereIn('order_id', $orderIds)->delete();
        }

        $kulinerOrderIds = \Illuminate\Support\Facades\DB::table('kuliner_orders')->where('tenant_id', $tenantId)->pluck('id');
        if ($kulinerOrderIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('kuliner_order_items')->whereIn('order_id', $kulinerOrderIds)->delete();
        }

        $retailCustomerReturnIds = \Illuminate\Support\Facades\DB::table('retail_customer_returns')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailCustomerReturnIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_customer_return_items')->whereIn('customer_return_id', $retailCustomerReturnIds)->delete();
        }

        $retailPayableIds = \Illuminate\Support\Facades\DB::table('retail_payables')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailPayableIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_payable_payments')->whereIn('payable_id', $retailPayableIds)->delete();
        }

        $retailPricelistIds = \Illuminate\Support\Facades\DB::table('retail_pricelists')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailPricelistIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_pricelist_items')->whereIn('pricelist_id', $retailPricelistIds)->delete();
        }

        $retailPurchaseIds = \Illuminate\Support\Facades\DB::table('retail_purchases')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailPurchaseIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_purchase_items')->whereIn('purchase_id', $retailPurchaseIds)->delete();
        }

        $retailReceivableIds = \Illuminate\Support\Facades\DB::table('retail_receivables')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailReceivableIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_receivable_payments')->whereIn('receivable_id', $retailReceivableIds)->delete();
        }

        $retailStockOpnameIds = \Illuminate\Support\Facades\DB::table('retail_stock_opnames')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailStockOpnameIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_stock_opname_items')->whereIn('stock_opname_id', $retailStockOpnameIds)->delete();
        }

        $retailSupplierReturnIds = \Illuminate\Support\Facades\DB::table('retail_supplier_returns')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailSupplierReturnIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_supplier_return_items')->whereIn('supplier_return_id', $retailSupplierReturnIds)->delete();
        }

        $retailTransactionIds = \Illuminate\Support\Facades\DB::table('retail_transactions')->where('tenant_id', $tenantId)->pluck('id');
        if ($retailTransactionIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('retail_transaction_items')->whereIn('transaction_id', $retailTransactionIds)->delete();
        }

        $budidayaCycleIds = \Illuminate\Support\Facades\DB::table('budidaya_cycles')->where('tenant_id', $tenantId)->pluck('id');
        if ($budidayaCycleIds->isNotEmpty()) {
            \Illuminate\Support\Facades\DB::table('budidaya_feedings')->whereIn('cycle_id', $budidayaCycleIds)->delete();
            \Illuminate\Support\Facades\DB::table('budidaya_harvests')->whereIn('cycle_id', $budidayaCycleIds)->delete();
            \Illuminate\Support\Facades\DB::table('budidaya_healths')->whereIn('cycle_id', $budidayaCycleIds)->delete();
        }

        // 2. Delete all records matching tenant_id from all tables dynamically
        $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database');
        $tableKey = 'Tables_in_' . $dbName;

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$tableKey;
            if (in_array($tableName, ['tenants', 'users'])) {
                continue;
            }
            
            $hasTenantId = \Illuminate\Support\Facades\Schema::hasColumn($tableName, 'tenant_id');
            if ($hasTenantId) {
                \Illuminate\Support\Facades\DB::table($tableName)->where('tenant_id', $tenantId)->delete();
            }
        }

        // 3. Delete non-tenant users for this tenant
        \Illuminate\Support\Facades\DB::table('users')->where('tenant_id', $tenantId)->where('id', '!=', $user->id)->delete();
        \Illuminate\Support\Facades\DB::table('tenants')->where('tenant_id', $tenantId)->delete();
        $user->delete();
    }

    private function seedDemoSandboxKulinerData(string $tenantId)
    {
        $categories = [
            ['name' => 'Makanan Utama', 'desc' => 'Aneka nasi goreng, mie goreng, dan lauk spesial.'],
            ['name' => 'Sup & Soto', 'desc' => 'Sup hangat berkuah segar dengan kaldu pilihan.'],
            ['name' => 'Camilan & Dessert', 'desc' => 'Camilan renyah dan pencuci mulut manis.'],
            ['name' => 'Minuman', 'desc' => 'Pilihan kopi, teh segar, dan jus buah.'],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['name']] = \App\Models\KulinerCategory::create([
                'tenant_id' => $tenantId,
                'name' => $cat['name'],
                'slug' => \Illuminate\Support\Str::slug($cat['name']) . '-' . \Illuminate\Support\Str::random(3),
                'description' => $cat['desc'],
            ]);
        }

        $products = [
            ['cat' => 'Makanan Utama', 'name' => 'Nasi Goreng Spesial', 'price' => 22000, 'desc' => 'Nasi goreng bumbu legendaris dengan telur, ayam suwir, dan kerupuk.'],
            ['cat' => 'Makanan Utama', 'name' => 'Mie Goreng Jawa', 'price' => 20000, 'desc' => 'Mie goreng tebal dengan kol, bakso, ayam suwir, dan aroma asap sedap.'],
            ['cat' => 'Makanan Utama', 'name' => 'Ayam Bakar Madu', 'price' => 28000, 'desc' => 'Ayam potong bakar bumbu karamel madu manis legit.'],
            ['cat' => 'Sup & Soto', 'name' => 'Soto Ayam Lamongan', 'price' => 18000, 'desc' => 'Soto ayam kuah kuning kental bertabur koya gurih melimpah.'],
            ['cat' => 'Camilan & Dessert', 'name' => 'Pisang Goreng Keju', 'price' => 12000, 'desc' => 'Pisang goreng tepung renyah dengan parutan keju cheddar.'],
            ['cat' => 'Minuman', 'name' => 'Es Teh Manis Jumbo', 'price' => 5000, 'desc' => 'Teh seduh wangi melati dingin menyegarkan.'],
            ['cat' => 'Minuman', 'name' => 'Kopi Susu Gula Aren', 'price' => 15000, 'desc' => 'Espresso creamy dipadu susu cair dan pemanis gula aren cair.'],
        ];

        $prodModels = [];
        foreach ($products as $p) {
            $prodModels[$p['name']] = \App\Models\KulinerProduct::create([
                'tenant_id' => $tenantId,
                'name' => $p['name'],
                'category_id' => $catModels[$p['cat']]->id,
                'price' => $p['price'],
                'description' => $p['desc'],
                'stock' => 99,
                'is_available' => true,
            ]);
        }

        \App\Models\KulinerSetting::create([
            'tenant_id'      => $tenantId,
            'store_name'     => 'Demo Resto Nusantara',
            'address'        => 'Jl. Nusantara No. 45, Jakarta Pusat',
            'phone'          => '0812-3456-7890',
            'opening_hours'  => '10:00 - 22:00',
            'operational_days' => 'Senin - Minggu',
            'total_tables'   => 12,
            'hero_title'     => 'Cita Rasa Nusantara Autentik',
            'hero_subtitle'  => 'Masakan rumahan berkualitas restoran',
            'promo_title'    => 'Promo Spesial Hari Ini!',
            'promo_desc'     => 'Dapatkan diskon 10% untuk pembelian di atas Rp 80.000',
            'whatsapp_number' => '081234567890',
        ]);

        \App\Models\KulinerPromo::create([
            'tenant_id' => $tenantId,
            'name' => 'Diskon Awal Bulan',
            'code' => 'DISKON10',
            'type' => 'discount',
            'value' => '10',
            'description' => 'Potongan 10% untuk semua menu makanan utama.',
            'quota' => 50,
            'expired_at' => now()->addDays(30),
            'status' => 'active',
        ]);
        \App\Models\KulinerPromo::create([
            'tenant_id' => $tenantId,
            'name' => 'Kupon Hemat Rp 15rb',
            'code' => 'HEMAT15',
            'type' => 'nominal',
            'value' => '15000',
            'description' => 'Potongan Rp 15.000 untuk minimal pembelian Rp 80.000.',
            'quota' => 20,
            'expired_at' => now()->addDays(15),
            'status' => 'active',
        ]);

        \App\Models\KulinerTestimonial::create([
            'tenant_id' => $tenantId,
            'customer_name' => 'Rian Kurniawan',
            'rating' => 5,
            'comment' => 'Nasi Goreng Spesialnya mantap sekali, bumbunya pas dan porsinya mengenyangkan!',
            'customer_role' => 'Pelanggan Setia',
            'is_displayed' => true,
        ]);
        \App\Models\KulinerTestimonial::create([
            'tenant_id' => $tenantId,
            'customer_name' => 'Sari Amalia',
            'rating' => 4,
            'comment' => 'Soto ayamnya segar, tapi parkirannya agak sempit pas jam makan siang.',
            'customer_role' => 'Pelanggan Baru',
            'is_displayed' => true,
        ]);
        \App\Models\KulinerTestimonial::create([
            'tenant_id' => $tenantId,
            'customer_name' => 'Budi Santoso',
            'rating' => 5,
            'comment' => 'Pelayanan ramah dan cepat. Sangat direkomendasikan untuk kumpul keluarga.',
            'customer_role' => 'Keluarga Cemara',
            'is_displayed' => true,
        ]);

        $role = \App\Models\KulinerRole::create([
            'tenant_id' => $tenantId,
            'name' => 'Supervisor',
            'permissions' => ['orders', 'products', 'reports']
        ]);

        $kulinerCategory = BusinessCategory::where('slug', 'kuliner')->first();
        User::create([
            'tenant_id' => $tenantId,
            'name' => 'Andi Supervisor',
            'email' => 'andi-' . \Illuminate\Support\Str::random(4) . '@umkm-demo.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'phone' => '08987654321',
            'status' => 'active',
            'business_category_id' => $kulinerCategory?->id,
            'kuliner_role_id' => $role->id
        ]);

        $customerNames = ['Arif', 'Dewi', 'Beni', 'Citra', 'Eko', 'Fitri', 'Gani', 'Hesti', 'Indra', 'Joni'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->subHours(rand(1, 10));
            $orderCount = rand(2, 4);
            for ($j = 0; $j < $orderCount; $j++) {
                $total = 0;
                $itemsToCreate = [];
                
                $prods = array_rand($prodModels, rand(1, 3));
                if (!is_array($prods)) {
                    $prods = [$prods];
                }
                
                foreach ($prods as $prodName) {
                    $prod = $prodModels[$prodName];
                    $qty = rand(1, 2);
                    $price = $prod->price;
                    $subtotal = $price * $qty;
                    $total += $subtotal;
                    
                    $itemsToCreate[] = [
                        'product_id' => $prod->id,
                        'name' => $prod->name,
                        'qty' => $qty,
                        'price' => $price,
                        'subtotal' => $subtotal,
                        'created_at' => $date,
                        'updated_at' => $date,
                    ];
                }
                
                $orderNumber = 'ORD-' . strtoupper(substr(uniqid(), -6));
                $order = \App\Models\Order::withoutGlobalScopes()->create([
                    'tenant_id' => $tenantId,
                    'order_number' => $orderNumber,
                    'customer_name' => $customerNames[array_rand($customerNames)],
                    'customer_phone' => '0812' . rand(10000000, 99999999),
                    'order_type' => rand(0, 1) ? 'dine_in' : 'take_away',
                    'table_number' => rand(1, 12),
                    'payment_method' => rand(0, 1) ? 'cash' : 'qris',
                    'notes' => '',
                    'total' => $total,
                    'status' => 'completed',
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                foreach ($itemsToCreate as $item) {
                    \Illuminate\Support\Facades\DB::table('order_items')->insert(array_merge($item, [
                        'order_id' => $order->id,
                    ]));
                }

                \App\Models\Transaction::create([
                    'tenant_id' => $tenantId,
                    'type' => 'income',
                    'source' => 'cashier_order',
                    'reference_id' => $order->id,
                    'amount' => $total,
                    'description' => "Pesanan Kasir: {$order->customer_name} (Order #{$order->id})",
                    'date' => $date->toDateString(),
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
            
            $expenseAmount = rand(30000, 70000);
            $expenseCats = ['Bahan Baku', 'Listrik & Air', 'Operasional', 'Lain-lain'];
            \App\Models\KulinerExpense::create([
                'tenant_id' => $tenantId,
                'date' => $date->format('Y-m-d'),
                'category' => $expenseCats[array_rand($expenseCats)],
                'description' => 'Pembelian operasional harian / logistik dapur.',
                'amount' => $expenseAmount,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}

