<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use App\Models\RetailCategory;
use App\Models\RetailUnit;
use App\Models\RetailProduct;
use App\Models\RetailSupplier;
use App\Models\RetailCustomer;
use App\Models\RetailExpenseCategory;
use App\Models\RetailExpense;
use App\Models\RetailSetting;
use App\Models\RetailRole;
use App\Models\RetailTransaction;
use App\Models\RetailTransactionItem;
use App\Models\RetailStockMovement;
use App\Models\RetailPurchase;
use App\Models\RetailPurchaseItem;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaInventory;
use App\Models\BudidayaStaff;
use App\Models\BudidayaExpense;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHealth;
use App\Models\BudidayaHarvest;
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
            ['name' => 'Toko Retail',      'slug' => 'toko-retail',      'description' => 'Manajemen stok & penjualan toko fisik/online', 'icon' => '🛒', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Budidaya Ikan',    'slug' => 'budidaya-ikan',    'description' => 'Pemantauan kolam ikan & siklus panen',          'icon' => '🐟', 'color' => '#10b981', 'sort_order' => 2],
            ['name' => 'Budidaya Tanaman', 'slug' => 'budidaya-tanaman', 'description' => 'Pemantauan lahan pertanian & siklus tanam',    'icon' => '🌱', 'color' => '#84cc16', 'sort_order' => 3],
            ['name' => 'Kuliner',          'slug' => 'kuliner',          'description' => 'Manajemen restoran & kasir digital',            'icon' => '🍱', 'color' => '#ef4444', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            BusinessCategory::updateOrCreate(['slug' => $cat['slug']], $cat + ['active' => true]);
        }
        $this->command->info('✅ Business categories seeded.');

        $this->call(SubscriptionPlanSeeder::class);
        $this->command->info('✅ Subscription plans seeded.');

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
        // TN-0001 (ahmad@retail.com) is the account the landing page's
        // "Demo Toko Retail" card actually logs into (see Landing.jsx
        // handleDemoLogin('retail')) — branded "Toko Demo" with rich
        // dummy data so every retail menu has something to show.
        $retailTenants = [
            ['email' => 'ahmad@retail.com', 'name' => 'Toko Demo',   'tenant_id' => 'TN-0001',  'business_name' => 'Toko Demo'],
            ['email' => 'retail@demo.com',  'name' => 'Retail Demo', 'tenant_id' => 'TN-RETAIL'],
        ];
        foreach ($retailTenants as $rt) {
            $this->createDemoTenant($rt['email'], $rt['name'], 'toko-retail', $rt['tenant_id'], $rt['business_name'] ?? null);
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

        // --- BUDIDAYA TANAMAN ---
        $tanamanTenants = [
            ['email' => 'tani@tanaman.com', 'name' => 'Tani Jaya', 'tenant_id' => 'TN-0003'],
            ['email' => 'tanaman@demo.com',  'name' => 'Tani Demo',  'tenant_id' => 'TN-TANAMAN'],
        ];
        foreach ($tanamanTenants as $tt) {
            $this->createDemoTenant($tt['email'], $tt['name'], 'budidaya-tanaman', $tt['tenant_id']);
            $this->seedTanamanData($tt['tenant_id']);
        }
        $this->command->info('✅ Budidaya Tanaman demo accounts seeded.');

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

    private function createDemoTenant(string $email, string $name, string $categorySlug, string $tenantId, ?string $businessName = null)
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
            'business_name'        => $businessName ?? ($name . ' Center'),
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

    public function seedRetailData(string $tenantId)
    {
        $user = User::where('tenant_id', $tenantId)->first();

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

        // 3. Products (final/current stock snapshot — includes one low-stock
        // and one out-of-stock item so Dashboard/Inventory alerts have data)
        $products = [
            ['cat' => 'Makanan',    'name' => 'Keripik Singkong Balado',    'price' => 15000,  'stock' => 143, 'unit' => 'Pack'],
            ['cat' => 'Makanan',    'name' => 'Kacang Umpet Karamel',       'price' => 25000,  'stock' => 60,  'unit' => 'Pack'],
            ['cat' => 'Makanan',    'name' => 'Paket Hampers Lebaran A',    'price' => 250000, 'stock' => 13,  'unit' => 'Box'],
            ['cat' => 'Makanan',    'name' => 'Stick Balado Pedas',         'price' => 9000,   'stock' => 215, 'unit' => 'Pack'],
            ['cat' => 'Minuman',    'name' => 'Air Mineral 600ml',          'price' => 4000,   'stock' => 50,  'unit' => 'Botol'],
            ['cat' => 'Minuman',    'name' => 'Teh Botol Sosro',            'price' => 6000,   'stock' => 30,  'unit' => 'Botol'],
            ['cat' => 'Sembako',    'name' => 'Beras Pandan Wangi 5kg',     'price' => 75000,  'stock' => 20,  'unit' => 'Pack'],
            ['cat' => 'Sembako',    'name' => 'Minyak Goreng Bimoli 1L',    'price' => 18000,  'stock' => 45,  'unit' => 'Liter'],
            ['cat' => 'Kebersihan', 'name' => 'Pembersih Lantai So Klin',   'price' => 12000,  'stock' => 24,  'unit' => 'Pack'],
            ['cat' => 'Kebersihan', 'name' => 'Sabun Cuci Piring Sunlight', 'price' => 9000,   'stock' => 35,  'unit' => 'Pack'],
            ['cat' => 'Alat Tulis', 'name' => 'Pulpen Standard AE7',        'price' => 3000,   'stock' => 8,   'unit' => 'Pcs', 'stock_min' => 10],
            ['cat' => 'Alat Tulis', 'name' => 'Buku Tulis 38 Lembar',       'price' => 4000,   'stock' => 0,   'unit' => 'Pcs'],
            ['cat' => 'Alat Tulis', 'name' => 'Penggaris Plastik 30cm',     'price' => 2500,   'stock' => 40,  'unit' => 'Pcs'],
        ];

        $productModels = [];
        foreach ($products as $p) {
            $productModels[$p['name']] = RetailProduct::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $p['name']],
                [
                    'category_id' => $catModels[$p['cat']]->id,
                    'sku' => strtoupper(substr($p['cat'], 0, 3)) . '-' . rand(1000, 9999),
                    'unit' => $p['unit'],
                    'stock' => $p['stock'],
                    'stock_min' => $p['stock_min'] ?? 10,
                    'price_buy' => $p['price'] * 0.85,
                    'price_sell' => $p['price'],
                ]
            );
        }

        if (!$user) {
            return; // nothing else below needs a tenant without an owner user
        }

        // 4. Suppliers
        $suppliers = [
            ['name' => 'CV Sumber Makmur Distribusi', 'contact' => '0812-3456-7890', 'address' => 'Jl. Raya Industri No. 12, Bandung'],
            ['name' => 'PT Indofood Distribusi Wilayah', 'contact' => '021-555-6677', 'address' => 'Jl. Gatot Subroto Km 5, Jakarta'],
            ['name' => 'Toko Grosir Berkah Jaya', 'contact' => '0813-2233-4455', 'address' => 'Pasar Induk Blok C-14, Bandung'],
        ];
        $supplierModels = [];
        foreach ($suppliers as $s) {
            $supplierModels[$s['name']] = RetailSupplier::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $s['name']],
                ['contact' => $s['contact'], 'address' => $s['address']]
            );
        }

        // 5. Customers
        $customers = [
            ['name' => 'Rina Kusuma', 'contact' => '0812-1111-2222', 'tier' => 'silver', 'points' => 125, 'total_spent' => 1250000],
            ['name' => 'Budi Santoso', 'contact' => '0813-3333-4444', 'tier' => 'gold', 'points' => 580, 'total_spent' => 5800000],
            ['name' => 'Dewi Anggraini', 'contact' => '0857-5555-6666', 'tier' => 'regular', 'points' => 32, 'total_spent' => 320000],
            ['name' => 'Andi Wijaya', 'contact' => '0821-7777-8888', 'tier' => 'regular', 'points' => 15, 'total_spent' => 150000],
        ];
        $customerModels = [];
        foreach ($customers as $c) {
            $customerModels[$c['name']] = RetailCustomer::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $c['name']],
                ['contact' => $c['contact'], 'tier' => $c['tier'], 'points' => $c['points'], 'total_spent' => $c['total_spent']]
            );
        }

        // 6. Expense categories + expenses
        $expenseCats = ['Operasional Toko', 'Gaji Karyawan', 'Sewa Tempat', 'Listrik & Air', 'Lain-lain'];
        $expenseCatModels = [];
        foreach ($expenseCats as $ec) {
            $expenseCatModels[$ec] = RetailExpenseCategory::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $ec]
            );
        }

        $expenses = [
            ['cat' => 'Sewa Tempat',      'days_ago' => 10, 'ket' => 'Sewa kios bulanan',                     'nominal' => 2000000],
            ['cat' => 'Listrik & Air',    'days_ago' => 5,  'ket' => 'Bayar listrik & air bulan ini',          'nominal' => 350000],
            ['cat' => 'Gaji Karyawan',    'days_ago' => 3,  'ket' => 'Gaji karyawan paruh waktu',              'nominal' => 1500000],
            ['cat' => 'Operasional Toko', 'days_ago' => 2,  'ket' => 'Beli plastik kresek & kantong belanja',  'nominal' => 85000],
            ['cat' => 'Lain-lain',        'days_ago' => 1,  'ket' => 'Service kulkas pendingin minuman',       'nominal' => 250000],
        ];
        foreach ($expenses as $e) {
            RetailExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'keterangan' => $e['ket']],
                [
                    'user_id' => $user->id,
                    'tanggal' => now()->subDays($e['days_ago'])->toDateString(),
                    'nominal' => $e['nominal'],
                    'expense_category_id' => $expenseCatModels[$e['cat']]->id,
                ]
            );
        }

        // 7. Settings
        RetailSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            ['tax_rate' => 0, 'points_ratio' => 10000, 'low_stock_default_threshold' => 10, 'receipt_footer' => 'Terima kasih telah berbelanja di Toko Demo!']
        );

        // 8. Roles + one cashier staff account
        $kasirRole = RetailRole::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Kasir'],
            ['permissions' => ['pos']]
        );
        RetailRole::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Manajer Toko'],
            ['permissions' => ['catalog', 'purchasing', 'inventory', 'pos', 'discounts', 'master', 'reports', 'finance']]
        );
        User::updateOrCreate(
            ['email' => 'kasir@toko-demo.com'],
            [
                'name' => 'Ani Kasir',
                'password' => Hash::make('password'),
                'role' => 'retail_cashier',
                'status' => 'active',
                'business_category_id' => $user->business_category_id,
                'tenant_id' => $tenantId,
                'retail_role_id' => $kasirRole->id,
            ]
        );

        // 9. Purchases (penerimaan barang) — 3 historical batches from the
        // suppliers above, each writing a matching "in" stock movement.
        $purchaseBatches = [
            [
                'days_ago' => 14,
                'supplier' => 'CV Sumber Makmur Distribusi',
                'notes' => 'Batch awal stok makanan & minuman',
                'items' => [
                    ['Keripik Singkong Balado', 149], ['Kacang Umpet Karamel', 63],
                    ['Stick Balado Pedas', 225], ['Air Mineral 600ml', 66], ['Teh Botol Sosro', 36],
                ],
            ],
            [
                'days_ago' => 10,
                'supplier' => 'PT Indofood Distribusi Wilayah',
                'notes' => 'Restok sembako & hampers',
                'items' => [
                    ['Beras Pandan Wangi 5kg', 23], ['Minyak Goreng Bimoli 1L', 49], ['Paket Hampers Lebaran A', 15],
                ],
            ],
            [
                'days_ago' => 14,
                'supplier' => 'Toko Grosir Berkah Jaya',
                'notes' => 'Stok kebersihan & alat tulis',
                'items' => [
                    ['Pembersih Lantai So Klin', 27], ['Sabun Cuci Piring Sunlight', 38],
                    ['Pulpen Standard AE7', 11], ['Buku Tulis 38 Lembar', 20], ['Penggaris Plastik 30cm', 46],
                ],
            ],
        ];

        foreach ($purchaseBatches as $batch) {
            $date = now()->subDays($batch['days_ago']);
            $totalCost = 0;
            $lineItems = [];
            foreach ($batch['items'] as [$prodName, $qty]) {
                $product = $productModels[$prodName];
                $cost = (float) $product->price_buy;
                $subtotal = $cost * $qty;
                $totalCost += $subtotal;
                $lineItems[] = ['product' => $product, 'qty' => $qty, 'cost' => $cost, 'subtotal' => $subtotal];
            }

            $purchase = new RetailPurchase();
            $purchase->fill([
                'tenant_id'     => $tenantId,
                'supplier_id'   => $supplierModels[$batch['supplier']]->id,
                'total_cost'    => $totalCost,
                'notes'         => $batch['notes'],
                'purchase_date' => $date->toDateString(),
            ]);
            $purchase->created_at = $date;
            $purchase->updated_at = $date;
            $purchase->save();


            foreach ($lineItems as $li) {
                RetailPurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $li['product']->id,
                    'qty' => $li['qty'],
                    'cost_per_item' => $li['cost'],
                    'subtotal' => $li['subtotal'],
                ]);

                RetailStockMovement::create([
                    'tenant_id' => $tenantId,
                    'product_id' => $li['product']->id,
                    'type' => 'in',
                    'quantity' => $li['qty'],
                    'quantity_before' => 0,
                    'quantity_after' => $li['qty'],
                    'reference_type' => RetailPurchase::class,
                    'reference_id' => $purchase->id,
                    'note' => "Penerimaan barang - {$batch['notes']}",
                    'user_id' => $user->id,
                    'created_at' => $date,
                ]);
            }
        }

        // Buku Tulis 38 Lembar was fully sold through before this seed's
        // sales window — log the depletion explicitly so its "habis" status
        // in Inventory/Stock Movements has a paper trail.
        RetailStockMovement::create([
            'tenant_id' => $tenantId,
            'product_id' => $productModels['Buku Tulis 38 Lembar']->id,
            'type' => 'out',
            'quantity' => -20,
            'quantity_before' => 20,
            'quantity_after' => 0,
            'note' => 'Penjualan borongan - musim awal tahun ajaran',
            'user_id' => $user->id,
            'created_at' => now()->subDays(3),
        ]);

        // 10. Sales transactions — spread across the last 8 days (incl.
        // today) so Dashboard/SalesReport/Transactions/Stock Movements all
        // have real history to show.
        $transactionPlans = [
            ['days_ago' => 8, 'customer' => null,             'method' => 'CASH',     'items' => [['Air Mineral 600ml', 2], ['Keripik Singkong Balado', 1]]],
            ['days_ago' => 8, 'customer' => 'Rina Kusuma',     'method' => 'QRIS',     'items' => [['Teh Botol Sosro', 3], ['Stick Balado Pedas', 2]]],
            ['days_ago' => 7, 'customer' => null,             'method' => 'CASH',     'items' => [['Minyak Goreng Bimoli 1L', 1], ['Beras Pandan Wangi 5kg', 1]]],
            ['days_ago' => 7, 'customer' => 'Budi Santoso',    'method' => 'CARD',     'items' => [['Paket Hampers Lebaran A', 1]]],
            ['days_ago' => 6, 'customer' => 'Dewi Anggraini',  'method' => 'CASH',     'items' => [['Sabun Cuci Piring Sunlight', 2], ['Pembersih Lantai So Klin', 1]]],
            ['days_ago' => 5, 'customer' => null,             'method' => 'CASH',     'items' => [['Kacang Umpet Karamel', 2], ['Air Mineral 600ml', 4]]],
            ['days_ago' => 5, 'customer' => 'Andi Wijaya',     'method' => 'TRANSFER', 'items' => [['Pulpen Standard AE7', 3], ['Penggaris Plastik 30cm', 2]]],
            ['days_ago' => 4, 'customer' => 'Rina Kusuma',     'method' => 'QRIS',     'items' => [['Keripik Singkong Balado', 3], ['Teh Botol Sosro', 2]]],
            ['days_ago' => 3, 'customer' => null,             'method' => 'CASH',     'items' => [['Stick Balado Pedas', 5], ['Air Mineral 600ml', 3]]],
            ['days_ago' => 3, 'customer' => 'Budi Santoso',    'method' => 'CASH',     'items' => [['Beras Pandan Wangi 5kg', 2], ['Minyak Goreng Bimoli 1L', 3]]],
            ['days_ago' => 2, 'customer' => null,             'method' => 'QRIS',     'items' => [['Sabun Cuci Piring Sunlight', 1], ['Penggaris Plastik 30cm', 4]]],
            ['days_ago' => 1, 'customer' => 'Dewi Anggraini',  'method' => 'CASH',     'items' => [['Kacang Umpet Karamel', 1], ['Pembersih Lantai So Klin', 2]]],
            ['days_ago' => 1, 'customer' => null,             'method' => 'CARD',     'items' => [['Air Mineral 600ml', 5]]],
            ['days_ago' => 0, 'customer' => 'Andi Wijaya',     'method' => 'CASH',     'items' => [['Keripik Singkong Balado', 2], ['Teh Botol Sosro', 1]]],
            ['days_ago' => 0, 'customer' => null,             'method' => 'QRIS',     'items' => [['Stick Balado Pedas', 3]]],
            ['days_ago' => 0, 'customer' => 'Rina Kusuma',     'method' => 'CASH',     'items' => [['Paket Hampers Lebaran A', 1], ['Air Mineral 600ml', 2]]],
        ];

        // Running stock per product, starting from each product's "opening"
        // level (its purchased-in quantity above), walked forward in date
        // order so the movement log's before/after numbers stay consistent
        // and land exactly on the product's current `stock` value.
        $runningStock = [];
        foreach ($purchaseBatches as $batch) {
            foreach ($batch['items'] as [$prodName, $qty]) {
                $runningStock[$prodName] = ($runningStock[$prodName] ?? 0) + $qty;
            }
        }

        $invoiceSeq = [];
        foreach ($transactionPlans as $plan) {
            $date = now()->subDays($plan['days_ago'])->setTime(9 + rand(0, 9), rand(0, 59));
            $dateKey = $date->format('Ymd');
            $invoiceSeq[$dateKey] = ($invoiceSeq[$dateKey] ?? 0) + 1;
            $invoiceNo = sprintf('INV-%s-%05d', $dateKey, $invoiceSeq[$dateKey]);

            $subtotal = 0;
            $lineItems = [];
            foreach ($plan['items'] as [$prodName, $qty]) {
                $product = $productModels[$prodName];
                $price = (float) $product->price_sell;
                $lineSubtotal = $price * $qty;
                $subtotal += $lineSubtotal;
                $lineItems[] = ['product' => $product, 'qty' => $qty, 'price' => $price, 'subtotal' => $lineSubtotal];
            }

            $customerId = $plan['customer'] ? $customerModels[$plan['customer']]->id : null;

            $transaction = new RetailTransaction();
            $transaction->fill([
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'customer_id' => $customerId,
                'invoice_no' => $invoiceNo,
                'total_amount' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'payment_method' => $plan['method'],
                'status' => 'paid',
                'paid_amount' => $subtotal,
                'change_amount' => 0,
            ]);
            $transaction->created_at = $date;
            $transaction->updated_at = $date;
            $transaction->save();

            foreach ($lineItems as $li) {
                RetailTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $li['product']->id,
                    'qty' => $li['qty'],
                    'price' => $li['price'],
                    'cost_price' => $li['product']->price_buy,
                    'subtotal' => $li['subtotal'],
                ]);

                $name = $li['product']->name;
                $before = $runningStock[$name] ?? $li['qty'];
                $after = $before - $li['qty'];
                $runningStock[$name] = $after;

                RetailStockMovement::create([
                    'tenant_id' => $tenantId,
                    'product_id' => $li['product']->id,
                    'type' => 'out',
                    'quantity' => -$li['qty'],
                    'quantity_before' => $before,
                    'quantity_after' => $after,
                    'reference_type' => RetailTransaction::class,
                    'reference_id' => $transaction->id,
                    'note' => "Penjualan {$invoiceNo}",
                    'user_id' => $user->id,
                    'created_at' => $date,
                ]);
            }

            if ($customerId) {
                $customer = $customerModels[$plan['customer']];
                $earned = (int) floor($subtotal / 10000);
                $customer->increment('points', $earned);
            }
        }
    }

    public function seedBudidayaData(string $tenantId)
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

        // 2. Inventory
        // 2. Inventory
        $feed = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Pelet PF-1000'],
            ['category' => 'pakan', 'unit' => 'Kg', 'stock' => 500, 'price_per_unit' => 12000, 'min_stock' => 50]
        );
        $seedNila = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Nila Merah'],
            ['category' => 'bibit', 'unit' => 'Ekor', 'stock' => 5000, 'price_per_unit' => 200, 'min_stock' => 1000]
        );
        $seedLele = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Lele Sangkuriang'],
            ['category' => 'bibit', 'unit' => 'Ekor', 'stock' => 10000, 'price_per_unit' => 150, 'min_stock' => 2000]
        );
        BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Vitamin C Ikan'],
            ['category' => 'obat', 'unit' => 'Botol', 'stock' => 20, 'price_per_unit' => 50000, 'min_stock' => 5]
        );

        // 2.5 Staff / Users
        BudidayaStaff::updateOrCreate(
            ['tenant_id' => $tenantId, 'email' => 'agus.manajer@ikan.com'],
            ['name' => 'Agus Manajer', 'phone' => '081122334455', 'position' => 'Manajer Tambak', 'status' => 'aktif']
        );
        BudidayaStaff::updateOrCreate(
            ['tenant_id' => $tenantId, 'email' => 'budi.pekerja@ikan.com'],
            ['name' => 'Budi Pekerja', 'phone' => '081566778899', 'position' => 'Pekerja Lapangan', 'status' => 'aktif']
        );

        // 3. Active Cycles & Logs
        if (isset($pondModels[0]) && isset($pondModels[1])) {
            $cycle1 = BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[0]->id, 'status' => 'aktif'],
                [
                    'seed_type' => 'Nila Merah Super',
                    'seed_count' => 1000,
                    'seed_date' => now()->subDays(30),
                    'expected_harvest_date' => now()->addDays(90),
                ]
            );

            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $cycle1->id, 'category' => 'benih'],
                ['amount' => 200000, 'date' => now()->subDays(30), 'notes' => 'Tebar benih awal']
            );
            
            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $cycle1->id, 'category' => 'pakan'],
                ['amount' => 500000, 'date' => now()->subDays(28), 'notes' => 'Stok pakan bulan pertama']
            );

            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycle1->id, 'date' => now()->subDays(2)],
                ['inventory_id' => $feed->id, 'amount_kg' => 2.5, 'notes' => 'Pakan pagi dan sore']
            );
            
            BudidayaHealth::updateOrCreate(
                ['cycle_id' => $cycle1->id, 'date' => now()->subDays(5)],
                ['mortality_count' => 12, 'disease_note' => 'Ikan lemas', 'treatment_note' => 'Pemberian vitamin C']
            );

            $cycle2 = BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[1]->id, 'status' => 'aktif'],
                [
                    'seed_type' => 'Lele Sangkuriang',
                    'seed_count' => 2000,
                    'seed_date' => now()->subDays(15),
                    'expected_harvest_date' => now()->addDays(75),
                ]
            );

            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $cycle2->id, 'category' => 'benih'],
                ['amount' => 300000, 'date' => now()->subDays(15), 'notes' => 'Tebar benih lele']
            );

            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycle2->id, 'date' => now()->subDays(1)],
                ['inventory_id' => $feed->id, 'amount_kg' => 4.0, 'notes' => 'Pakan intensif']
            );
        }

        // 4. Past Cycle (Harvested)
        if (isset($pondModels[2])) {
            $pastCycle = BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[2]->id, 'status' => 'panen'],
                [
                    'seed_type' => 'Gurame Soang',
                    'seed_count' => 500,
                    'seed_date' => now()->subMonths(6),
                    'expected_harvest_date' => now()->subDays(10),
                ]
            );

            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $pastCycle->id, 'category' => 'benih'],
                ['amount' => 750000, 'date' => now()->subMonths(6), 'notes' => 'Tebar gurame']
            );
            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $pastCycle->id, 'category' => 'pakan'],
                ['amount' => 1500000, 'date' => now()->subMonths(4), 'notes' => 'Total pakan']
            );
            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $pastCycle->id, 'category' => 'gaji'],
                ['amount' => 500000, 'date' => now()->subDays(10), 'notes' => 'Upah panen borongan']
            );

            BudidayaHarvest::updateOrCreate(
                ['cycle_id' => $pastCycle->id],
                [
                    'harvest_date' => now()->subDays(10),
                    'total_weight_kg' => 200,
                    'sale_price_per_kg' => 45000,
                    'total_revenue' => 200 * 45000,
                    'notes' => 'Panen total ukuran konsumsi'
                ]
            );

            // Feeding logs for past cycle
            $feedingDates = [
                ['days' => 180, 'kg' => 3.0, 'note' => 'Pakan hari pertama'],
                ['days' => 150, 'kg' => 4.5, 'note' => 'Pakan rutin pagi & sore'],
                ['days' => 120, 'kg' => 5.0, 'note' => 'Pakan intensif pertumbuhan'],
                ['days' => 90,  'kg' => 6.0, 'note' => 'Pakan menjelang panen'],
                ['days' => 60,  'kg' => 7.5, 'note' => 'Pakan fattening'],
                ['days' => 30,  'kg' => 8.0, 'note' => 'Pakan finish fattening'],
            ];
            foreach ($feedingDates as $f) {
                BudidayaFeeding::updateOrCreate(
                    ['cycle_id' => $pastCycle->id, 'date' => now()->subDays($f['days'])],
                    ['inventory_id' => $feed->id, 'amount_kg' => $f['kg'], 'notes' => $f['note']]
                );
            }

            // Health logs for past cycle
            BudidayaHealth::updateOrCreate(
                ['cycle_id' => $pastCycle->id, 'date' => now()->subDays(120)],
                ['mortality_count' => 5, 'disease_note' => 'Kulit lecet', 'treatment_note' => 'Penambahan garam ikan']
            );
            BudidayaHealth::updateOrCreate(
                ['cycle_id' => $pastCycle->id, 'date' => now()->subDays(80)],
                ['mortality_count' => 3, 'disease_note' => 'Ikan kurang aktif', 'treatment_note' => 'Pemberian vitamin C dan aerasi tambahan']
            );
        }
    }

    public function seedKulinerData(string $tenantId)
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

    public function seedTanamanData(string $tenantId)
    {
        // 1. Ponds (Lahan)
        $ponds = [
            ['name' => 'Lahan A1 - Cabai', 'type' => 'tanah', 'capacity_m3' => 15, 'status' => 'aktif'],
            ['name' => 'Greenhouse A2 - Tomat', 'type' => 'beton', 'capacity_m3' => 15, 'status' => 'aktif'],
            ['name' => 'Lahan B1 - Melon', 'type' => 'tanah', 'capacity_m3' => 30, 'status' => 'kosong'],
            ['name' => 'Lahan C1 - Sayuran', 'type' => 'terpal', 'capacity_m3' => 50, 'status' => 'kosong'],
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

        // 2. Inventory
        $feed = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Pupuk NPK Mutiara'],
            ['category' => 'pakan', 'unit' => 'Kg', 'stock' => 500, 'price_per_unit' => 15000, 'min_stock' => 50]
        );
        BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Cabai Rawit'],
            ['category' => 'bibit', 'unit' => 'Pcs', 'stock' => 5000, 'price_per_unit' => 500, 'min_stock' => 1000]
        );
        BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Tomat Cherry'],
            ['category' => 'bibit', 'unit' => 'Pcs', 'stock' => 10000, 'price_per_unit' => 800, 'min_stock' => 2000]
        );
        BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Pestisida Nabati Organik'],
            ['category' => 'obat', 'unit' => 'Botol', 'stock' => 20, 'price_per_unit' => 65000, 'min_stock' => 5]
        );

        // 2.5 Staff / Users
        BudidayaStaff::updateOrCreate(
            ['tenant_id' => $tenantId, 'email' => 'tani.manajer@tanaman.com'],
            ['name' => 'Pak Tani Manajer', 'phone' => '081299887766', 'position' => 'Manajer Lahan', 'status' => 'aktif']
        );
        BudidayaStaff::updateOrCreate(
            ['tenant_id' => $tenantId, 'email' => 'tani.pekerja@tanaman.com'],
            ['name' => 'Pekerja Kebun', 'phone' => '081344556677', 'position' => 'Pekerja Kebun', 'status' => 'aktif']
        );

        // 3. Active Cycles & Logs
        if (isset($pondModels[0]) && isset($pondModels[1])) {
            $cycle1 = BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[0]->id, 'status' => 'aktif'],
                [
                    'seed_type' => 'Cabai Rawit Merah',
                    'seed_count' => 1000,
                    'seed_date' => now()->subDays(30),
                    'expected_harvest_date' => now()->addDays(90),
                ]
            );

            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $cycle1->id, 'category' => 'benih'],
                ['amount' => 500000, 'date' => now()->subDays(30), 'notes' => 'Pembelian bibit cabai']
            );
            
            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $cycle1->id, 'category' => 'pakan'],
                ['amount' => 300000, 'date' => now()->subDays(28), 'notes' => 'Stok pupuk pertama']
            );

            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycle1->id, 'date' => now()->subDays(2)],
                ['inventory_id' => $feed->id, 'amount_kg' => 5.0, 'notes' => 'Pemupukan NPK awal']
            );
            
            BudidayaHealth::updateOrCreate(
                ['cycle_id' => $cycle1->id, 'date' => now()->subDays(5)],
                ['mortality_count' => 15, 'disease_note' => 'Daun menguning', 'treatment_note' => 'Pemberian pupuk kandang & air tambahan']
            );

            $cycle2 = BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[1]->id, 'status' => 'aktif'],
                [
                    'seed_type' => 'Tomat Cherry',
                    'seed_count' => 2000,
                    'seed_date' => now()->subDays(15),
                    'expected_harvest_date' => now()->addDays(75),
                ]
            );

            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $cycle2->id, 'category' => 'benih'],
                ['amount' => 1600000, 'date' => now()->subDays(15), 'notes' => 'Pembelian bibit tomat']
            );

            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycle2->id, 'date' => now()->subDays(1)],
                ['inventory_id' => $feed->id, 'amount_kg' => 8.0, 'notes' => 'Pemupukan intensif']
            );
        }

        // 4. Past Cycle (Harvested)
        if (isset($pondModels[2])) {
            $pastCycle = BudidayaCycle::updateOrCreate(
                ['tenant_id' => $tenantId, 'pond_id' => $pondModels[2]->id, 'status' => 'panen'],
                [
                    'seed_type' => 'Melon Gold',
                    'seed_count' => 500,
                    'seed_date' => now()->subMonths(6),
                    'expected_harvest_date' => now()->subDays(10),
                ]
            );

            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $pastCycle->id, 'category' => 'benih'],
                ['amount' => 1000000, 'date' => now()->subMonths(6), 'notes' => 'Pembelian bibit melon']
            );
            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $pastCycle->id, 'category' => 'pakan'],
                ['amount' => 2000000, 'date' => now()->subMonths(4), 'notes' => 'Total pupuk melon']
            );
            BudidayaExpense::updateOrCreate(
                ['tenant_id' => $tenantId, 'cycle_id' => $pastCycle->id, 'category' => 'gaji'],
                ['amount' => 600000, 'date' => now()->subDays(10), 'notes' => 'Upah pekerja panen']
            );

            BudidayaHarvest::updateOrCreate(
                ['cycle_id' => $pastCycle->id],
                [
                    'harvest_date' => now()->subDays(10),
                    'total_weight_kg' => 800,
                    'sale_price_per_kg' => 20000,
                    'total_revenue' => 800 * 20000,
                    'notes' => 'Panen total melon kualitas super'
                ]
            );

            $feedingDates = [
                ['days' => 180, 'kg' => 6.0, 'note' => 'Pemupukan dasar'],
                ['days' => 150, 'kg' => 8.0, 'note' => 'Pemupukan lanjutan pertama'],
                ['days' => 120, 'kg' => 10.0, 'note' => 'Log pemupukan rutin'],
                ['days' => 90,  'kg' => 12.0, 'note' => 'Log pemupukan rutin'],
                ['days' => 60,  'kg' => 15.0, 'note' => 'Log pemupukan pembesaran buah'],
                ['days' => 30,  'kg' => 10.0, 'note' => 'Log pemupukan akhir menjelang panen'],
            ];
            foreach ($feedingDates as $f) {
                BudidayaFeeding::updateOrCreate(
                    ['cycle_id' => $pastCycle->id, 'date' => now()->subDays($f['days'])],
                    ['inventory_id' => $feed->id, 'amount_kg' => $f['kg'], 'notes' => $f['note']]
                );
            }

            BudidayaHealth::updateOrCreate(
                ['cycle_id' => $pastCycle->id, 'date' => now()->subDays(120)],
                ['mortality_count' => 10, 'disease_note' => 'Daun keriting/layu', 'treatment_note' => 'Pemberian pestisida nabati']
            );
        }
    }
}
