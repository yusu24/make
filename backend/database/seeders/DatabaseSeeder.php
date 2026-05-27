<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use App\Models\RetailCategory;
use App\Models\RetailUnit;
use App\Models\RetailProduct;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\KulinerCategory;
use App\Models\KulinerProduct;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 1. Business Categories ───────────────────────────────────────────
        $categories = [
            ['name' => 'Toko Retail',   'slug' => 'toko-retail',   'description' => 'Manajemen stok & penjualan toko fisik/online', 'icon' => '🛒', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Budidaya Ikan', 'slug' => 'budidaya-ikan', 'description' => 'Pemantauan kolam ikan & siklus panen',          'icon' => '🐟', 'color' => '#10b981', 'sort_order' => 2],
            ['name' => 'Kuliner',       'slug' => 'kuliner',       'description' => 'Manajemen restoran & kasir digital',            'icon' => '🍱', 'color' => '#ef4444', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            BusinessCategory::updateOrCreate(['slug' => $cat['slug']], $cat + ['active' => true]);
        }
        $this->command->info('✅ Business categories seeded.');

        // ─── 2. Super Admin Logins ───────────────────────────────────────────
        $superAdmins = [
            ['email' => 'needleproject240696@gmail.com', 'name' => 'Super Admin SaaS', 'password' => 'Aku240696@'],
        ];

        foreach ($superAdmins as $sa) {
            User::updateOrCreate(['email' => $sa['email']], [
                'name'     => $sa['name'],
                'password' => Hash::make($sa['password']),
                'role'     => 'super_admin',
                'status'   => 'active',
            ]);
        }
        $this->command->info('✅ Super Admins seeded.');

        // ─── 3. Demo Tenant Accounts for Each Category ────────────────────────
        
        // --- TOKO RETAIL ---
        $retailTenants = [
            ['email' => 'ahmad@retail.com', 'name' => 'Ahmad Retail', 'tenant_id' => 'TN-0001'],
            ['email' => 'retail@demo.com',  'name' => 'Retail Demo',  'tenant_id' => 'TN-RETAIL'],
        ];
        foreach ($retailTenants as $rt) {
            $this->createDemoTenant($rt['email'], $rt['name'], 'toko-retail', $rt['tenant_id']);
            $this->seedRetailData($rt['tenant_id']);
        }
        $this->command->info('✅ Toko Retail demo accounts seeded.');

        // --- BUDIDAYA IKAN ---
        $budidayaTenants = [
            ['email' => 'siti@ikan.com', 'name' => 'Siti Budidaya', 'tenant_id' => 'TN-0002'],
            ['email' => 'budidaya@demo.com',  'name' => 'Budidaya Demo',  'tenant_id' => 'TN-BUDIDAYA'],
        ];
        foreach ($budidayaTenants as $bt) {
            $this->createDemoTenant($bt['email'], $bt['name'], 'budidaya-ikan', $bt['tenant_id']);
            $this->seedBudidayaData($bt['tenant_id']);
        }
        $this->command->info('✅ Budidaya Ikan demo accounts seeded.');

        // --- KULINER ---
        $kulinerTenants = [
            ['email' => 'dewi@kuliner.com', 'name' => 'Dewi Culinary', 'tenant_id' => 'TN-0005'],
            ['email' => 'kuliner@demo.com', 'name' => 'Kuliner Demo',  'tenant_id' => 'TN-KULINER'],
        ];
        foreach ($kulinerTenants as $kt) {
            $this->createDemoTenant($kt['email'], $kt['name'], 'kuliner', $kt['tenant_id']);
            $this->seedKulinerData($kt['tenant_id']);
        }
        $this->command->info('✅ Kuliner demo accounts seeded.');

        // --- JASA ---
        $jasaTenants = [
            ['email' => 'jasa@demo.com', 'name' => 'Budi Jasa Demo', 'tenant_id' => 'TN-JASA'],
        ];
        foreach ($jasaTenants as $jt) {
            $this->createDemoTenant($jt['email'], $jt['name'], 'jasa', $jt['tenant_id']);
        }
        $this->command->info('✅ Jasa demo accounts seeded.');

        // --- MANUFAKTUR ---
        $manufakturTenants = [
            ['email' => 'manufaktur@demo.com', 'name' => 'Hendra Manufaktur Demo', 'tenant_id' => 'TN-MANUFAKTUR'],
        ];
        foreach ($manufakturTenants as $mt) {
            $this->createDemoTenant($mt['email'], $mt['name'], 'manufaktur', $mt['tenant_id']);
        }
        $this->command->info('✅ Manufaktur demo accounts seeded.');

        $this->command->info('🚀 All Category Demo Accounts Seeded Successfully!');
        
    }

    private function createDemoTenant(string $email, string $name, string $categorySlug, string $tenantId)
    {
        $category = BusinessCategory::where('slug', $categorySlug)->first();
        if (!$category) return null;

        $user = User::updateOrCreate(['email' => $email], [
            'name'                 => $name,
            'password'             => Hash::make('password'),
            'role'                 => 'customer',
            'status'               => 'active',
            'business_category_id' => $category->id,
            'tenant_id'            => $tenantId,
        ]);
        
        $user->update(['tenant_id' => $tenantId, 'business_category_id' => $category->id]);

        $tenant = Tenant::updateOrCreate(['tenant_id' => $tenantId], [
            'user_id'              => $user->id,
            'name'                 => $name,
            'business_category_id' => $category->id,
            'business_name'        => $name . ' Center',
            'subscription_plan'    => 'free',
            'status'               => 'active',
        ]);

        // Attach all system modules as active for maximum demo exposure
        $modules = DB::table('modules')->get();
        foreach ($modules as $mod) {
            DB::table('business_modules')->updateOrInsert(
                ['tenant_id' => $tenantId, 'module_id' => $mod->id],
                ['is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        return ['user' => $user, 'tenant' => $tenant, 'category' => $category];
    }

    private function seedRetailData(string $tenantId)
    {
        // 1. Units
        $units = ['Pcs', 'Box', 'Kg', 'Liter', 'Pack', 'Botol', 'Sachet'];
        $unitModels = [];
        foreach ($units as $u) {
            $unitModels[$u] = RetailUnit::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $u]
            );
        }

        // 2. Categories
        $cats = ['Makanan', 'Minuman', 'Sembako', 'Alat Tulis', 'Kebersihan'];
        $catModels = [];
        foreach ($cats as $c) {
            $catModels[$c] = RetailCategory::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $c]
            );
        }

        // 3. Products
        $products = [
            ['cat' => 'Makanan', 'name' => 'Keripik Singkong Balado', 'price' => 15000, 'stock' => 143, 'unit' => 'Pack'],
            ['cat' => 'Makanan', 'name' => 'Kacang Umpet Karamel', 'price' => 25000, 'stock' => 60, 'unit' => 'Pack'],
            ['cat' => 'Makanan', 'name' => 'Paket Hampers Lebaran A', 'price' => 250000, 'stock' => 13, 'unit' => 'Box'],
            ['cat' => 'Makanan', 'name' => 'Stick Balado Pedas', 'price' => 9000, 'stock' => 215, 'unit' => 'Pack'],
            ['cat' => 'Minuman', 'name' => 'Air Mineral 600ml', 'price' => 4000, 'stock' => 50, 'unit' => 'Botol'],
            ['cat' => 'Minuman', 'name' => 'Teh Botol Sosro', 'price' => 6000, 'stock' => 30, 'unit' => 'Botol'],
            ['cat' => 'Sembako', 'name' => 'Beras Pandan Wangi 5kg', 'price' => 75000, 'stock' => 20, 'unit' => 'Pack'],
            ['cat' => 'Sembako', 'name' => 'Minyak Goreng Bimoli 1L', 'price' => 18000, 'stock' => 45, 'unit' => 'Liter'],
            ['cat' => 'Kebersihan', 'name' => 'Pembersih Lantai So Klin', 'price' => 12000, 'stock' => 24, 'unit' => 'Pack'],
        ];

        foreach ($products as $p) {
            RetailProduct::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $p['name']],
                [
                    'category_id' => $catModels[$p['cat']]->id,
                    'sku' => strtoupper(substr($p['cat'], 0, 3)) . '-' . rand(1000, 9999),
                    'unit' => $p['unit'],
                    'stock' => $p['stock'],
                    'stock_min' => 10,
                    'price_buy' => $p['price'] * 0.85,
                    'price_sell' => $p['price'],
                ]
            );
        }
    }

    private function seedBudidayaData(string $tenantId)
    {
        // 1. Ponds
        $ponds = [
            ['name' => 'Kolam A1 - Nila', 'type' => 'terpal', 'capacity_m3' => 15, 'status' => 'aktif'],
            ['name' => 'Kolam A2 - Lele', 'type' => 'terpal', 'capacity_m3' => 15, 'status' => 'aktif'],
            ['name' => 'Kolam B1 - Beton', 'type' => 'beton', 'capacity_m3' => 30, 'status' => 'kosong'],
            ['name' => 'Kolam C1 - Tanah', 'type' => 'tanah', 'capacity_m3' => 50, 'status' => 'kosong'],
        ];

        $pondModels = [];
        foreach ($ponds as $p) {
            $pondModels[] = BudidayaPond::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $p['name']],
                [
                    'type' => $p['type'],
                    'capacity_m3' => $p['capacity_m3'],
                    'status' => $p['status'],
                ]
            );
        }

        // 2. Active Cycles
        if (isset($pondModels[0]) && isset($pondModels[1])) {
            BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[0]->id, 'status' => 'aktif'],
                [
                    'seed_type' => 'Nila Merah Super',
                    'seed_count' => 1000,
                    'seed_date' => now()->subDays(30),
                    'expected_harvest_date' => now()->addDays(90),
                ]
            );

            BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[1]->id, 'status' => 'aktif'],
                [
                    'seed_type' => 'Lele Sangkuriang',
                    'seed_count' => 2000,
                    'seed_date' => now()->subDays(15),
                    'expected_harvest_date' => now()->addDays(75),
                ]
            );
        }
    }

    private function seedKulinerData(string $tenantId)
    {
        // 1. Categories
        $categories = [
            ['name' => 'Makanan Utama', 'desc' => 'Aneka nasi goreng, mie goreng, dan lauk spesial.'],
            ['name' => 'Sup & Soto', 'desc' => 'Sup hangat berkuah segar dengan kaldu pilihan.'],
            ['name' => 'Camilan & Dessert', 'desc' => 'Camilan renyah dan pencuci mulut manis.'],
            ['name' => 'Minuman', 'desc' => 'Pilihan kopi, teh segar, dan jus buah.'],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['name']] = KulinerCategory::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $cat['name']],
                [
                    'slug' => Str::slug($cat['name']) . '-' . Str::random(3),
                    'description' => $cat['desc'],
                ]
            );
        }

        // 2. Products
        $products = [
            ['cat' => 'Makanan Utama', 'name' => 'Nasi Goreng Spesial', 'price' => 22000, 'desc' => 'Nasi goreng bumbu legendaris dengan telur, ayam suwir, dan kerupuk.'],
            ['cat' => 'Makanan Utama', 'name' => 'Mie Goreng Jawa', 'price' => 20000, 'desc' => 'Mie goreng tebal dengan kol, bakso, ayam suwir, dan aroma asap sedap.'],
            ['cat' => 'Makanan Utama', 'name' => 'Ayam Bakar Madu', 'price' => 28000, 'desc' => 'Ayam potong bakar bumbu karamel madu manis legit.'],
            ['cat' => 'Sup & Soto', 'name' => 'Soto Ayam Lamongan', 'price' => 18000, 'desc' => 'Soto ayam kuah kuning kental bertabur koya gurih melimpah.'],
            ['cat' => 'Camilan & Dessert', 'name' => 'Pisang Goreng Keju', 'price' => 12000, 'desc' => 'Pisang goreng tepung renyah dengan parutan keju cheddar.'],
            ['cat' => 'Minuman', 'name' => 'Es Teh Manis Jumbo', 'price' => 5000, 'desc' => 'Teh seduh wangi melati dingin menyegarkan.'],
            ['cat' => 'Minuman', 'name' => 'Kopi Susu Gula Aren', 'price' => 15000, 'desc' => 'Espresso creamy dipadu susu cair dan pemanis gula aren cair.'],
        ];

        foreach ($products as $p) {
            KulinerProduct::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $p['name']],
                [
                    'category_id' => $catModels[$p['cat']]->id,
                    'price' => $p['price'],
                    'description' => $p['desc'],
                    'stock' => 99,
                    'is_available' => true,
                ]
            );
        }
    }
}
