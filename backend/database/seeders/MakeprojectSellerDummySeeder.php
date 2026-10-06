<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use App\Models\RetailCategory;
use App\Models\RetailUnit;
use App\Models\RetailProduct;
use App\Models\RetailSupplier;
use App\Models\RetailCustomer;
use App\Models\RetailPurchase;
use App\Models\RetailPurchaseItem;
use App\Models\RetailTransaction;
use App\Models\RetailTransactionItem;
use App\Models\RetailTransactionPayment;
use App\Models\RetailFinanceCategory;
use App\Models\RetailIncome;
use App\Models\RetailExpense;
use App\Models\RetailOutlet;
use App\Models\RetailShift;
use App\Models\RetailPayable;
use App\Models\RetailReceivable;
use App\Models\RetailDiscount;
use App\Models\RetailPricelist;
use App\Models\RetailPricelistItem;
use App\Models\RetailRole;
use App\Models\RetailSetting;
use App\Models\SellerWarehouse;
use App\Models\SellerChannel;
use App\Models\SellerProduct;
use App\Models\SellerOrder;
use App\Models\SellerSyncLog;
use App\Models\SupportTicket;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class MakeprojectSellerDummySeeder extends Seeder
{
    protected string $targetEmail = 'makeproject240696@gmail.com';

    public function run(): void
    {
        $this->command?->info("Starting Seeder for {$this->targetEmail} (Ritel & Omnichannel)...");

        // 1. Business Category (Ritel & Omnichannel / seller)
        $cat = BusinessCategory::where('slug', 'seller')
            ->orWhere('name', 'Ritel & Omnichannel')
            ->orWhere('id', 5)
            ->first();

        if (!$cat) {
            $cat = BusinessCategory::create([
                'id' => 5,
                'name' => 'Ritel & Omnichannel',
                'slug' => 'seller',
                'description' => 'Manajemen toko fisik (POS), multi-gudang & sinkronisasi omnichannel marketplace',
                'icon' => '🛍️',
                'color' => '#0284c7',
                'active' => true,
            ]);
        }

        // 2. User Target
        $user = User::where('email', $this->targetEmail)->first();
        if (!$user) {
            $user = User::create([
                'name' => 'MakeProject Store',
                'email' => $this->targetEmail,
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'status' => 'active',
                'business_category_id' => $cat->id,
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]);
            $this->command?->info("Created user {$this->targetEmail} with default password 'password123'");
        } else {
            $user->update([
                'status' => 'active',
                'role' => in_array($user->role, ['super_admin', 'admin']) ? $user->role : 'customer',
                'business_category_id' => $cat->id,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ]);
            $this->command?->info("Found existing user {$this->targetEmail} (ID: {$user->id})");
        }

        // 3. Tenant
        $tenant = Tenant::where('user_id', $user->id)
            ->orWhere('tenant_id', $user->tenant_id)
            ->first();

        $tenantId = $tenant?->tenant_id ?: ($user->tenant_id ?: ('TN-' . str_pad($user->id, 4, '0', STR_PAD_LEFT)));

        if (!$tenant) {
            $tenant = Tenant::create([
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'name' => $user->name ?: 'MakeProject Store',
                'business_name' => 'MakeProject Omnichannel & Retail Hub',
                'business_category_id' => $cat->id,
                'subscription_plan' => 'enterprise',
                'status' => 'active',
                'subscription_expires_at' => Carbon::now()->addYear(),
                'trial_ends_at' => Carbon::now()->addDays(30),
            ]);
            $this->command?->info("Created tenant {$tenantId}");
        } else {
            $tenant->update([
                'business_category_id' => $cat->id,
                'business_name' => $tenant->business_name ?: 'MakeProject Omnichannel & Retail Hub',
                'subscription_plan' => 'enterprise',
                'status' => 'active',
                'subscription_expires_at' => Carbon::now()->addYear(),
                'trial_ends_at' => Carbon::now()->addDays(30),
            ]);
            $this->command?->info("Updated tenant {$tenantId} to Enterprise plan");
        }

        // Link tenant_id back to user
        $user->update(['tenant_id' => $tenantId]);

        // 4. Clean previous dummy data for this tenant to allow safe re-runs
        $this->command?->info("Cleaning old dummy records for tenant {$tenantId}...");
        SellerWarehouse::where('tenant_id', $tenantId)->delete();
        SellerChannel::where('tenant_id', $tenantId)->delete();
        SellerProduct::where('tenant_id', $tenantId)->delete();
        SellerOrder::where('tenant_id', $tenantId)->delete();
        SellerSyncLog::where('tenant_id', $tenantId)->delete();
        RetailTransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenantId))->delete();
        RetailTransactionPayment::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenantId))->delete();
        RetailTransaction::where('tenant_id', $tenantId)->delete();
        RetailPurchaseItem::whereHas('purchase', fn($q) => $q->where('tenant_id', $tenantId))->delete();
        RetailPurchase::where('tenant_id', $tenantId)->delete();
        RetailPayable::where('tenant_id', $tenantId)->delete();
        RetailReceivable::where('tenant_id', $tenantId)->delete();
        RetailExpense::where('tenant_id', $tenantId)->delete();
        RetailIncome::where('tenant_id', $tenantId)->delete();
        RetailShift::where('tenant_id', $tenantId)->delete();
        RetailOutlet::where('tenant_id', $tenant->id)->delete();
        SupportTicket::where('tenant_id', $tenantId)->delete();

        // 5. Retail Master: Outlet
        RetailOutlet::create([
            'tenant_id' => $tenant->id,
            'name' => 'Toko Flagship Jakarta (Pusat)',
            'address' => 'Jl. Boulevard Artha Gading No. 88, Kelapa Gading, Jakarta Utara',
            'phone' => '081234567890',
            'is_primary' => true,
        ]);

        // 6. Retail Master: Units
        $units = ['Pcs', 'Box', 'Pack', 'Botol', 'Sachet', 'Kg', 'Set'];
        foreach ($units as $u) {
            RetailUnit::firstOrCreate(['tenant_id' => $tenantId, 'name' => $u]);
        }

        // 7. Retail Master: Categories
        $categoriesData = [
            'Beauty & Skincare'     => ['GlowUp Serum', 'Sunscreen', 'Cleanser'],
            'Gadget & Elektronik'   => ['Headset', 'Powerbank', 'Kabel Data'],
            'Fashion & Apparel'     => ['Kaos Oversized', 'Jaket Denim'],
            'Sembako & Daily Needs' => ['Beras Premium', 'Minyak Goreng'],
        ];
        $catModels = [];
        foreach (array_keys($categoriesData) as $catName) {
            $catModels[$catName] = RetailCategory::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => $catName]
            );
        }

        // 8. Retail Master: Setting
        RetailSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'store_name' => 'MakeProject Omnichannel & Retail Store',
                'store_phone' => '081234567890',
                'store_address' => 'Jl. Boulevard Artha Gading No. 88, Kelapa Gading, Jakarta Utara',
                'tax_rate' => 11,
                'enable_tax' => true,
                'enable_loyalty' => true,
                'point_value_rupiah' => 100,
                'points_ratio' => 10000,
                'receipt_footer' => 'Terima kasih telah berbelanja di MakeProject! Simpan struk ini untuk klaim garansi/penukaran barang dalam 3 hari.',
            ]
        );

        // 9. Retail Master: Products
        $productsData = [
            [
                'cat' => 'Beauty & Skincare',
                'name' => 'GlowUp Vitamin C Brightening Serum 30ml',
                'sku' => 'GLOW-SERUM-30',
                'price_buy' => 42000,
                'price_sell' => 135000,
                'stock' => 342,
                'stock_min' => 20,
                'unit' => 'Botol',
            ],
            [
                'cat' => 'Beauty & Skincare',
                'name' => 'GlowUp UV Shield Sunscreen SPF 50 PA++++',
                'sku' => 'GLOW-SUNSCREEN-50',
                'price_buy' => 31000,
                'price_sell' => 95000,
                'stock' => 185,
                'stock_min' => 15,
                'unit' => 'Botol',
            ],
            [
                'cat' => 'Beauty & Skincare',
                'name' => 'GlowUp Gentle Hydrating Facial Cleanser 100ml',
                'sku' => 'GLOW-CLEANSER-100',
                'price_buy' => 25000,
                'price_sell' => 79000,
                'stock' => 210,
                'stock_min' => 15,
                'unit' => 'Botol',
            ],
            [
                'cat' => 'Gadget & Elektronik',
                'name' => 'TechZone Noise Cancelling Wireless Headset Pro',
                'sku' => 'TZ-HEADSET-PRO',
                'price_buy' => 195000,
                'price_sell' => 489000,
                'stock' => 48,
                'stock_min' => 10,
                'unit' => 'Box',
            ],
            [
                'cat' => 'Gadget & Elektronik',
                'name' => 'TechZone Fast Charge Powerbank 20.000mAh 65W',
                'sku' => 'TZ-POWERBANK-20K',
                'price_buy' => 110000,
                'price_sell' => 299000,
                'stock' => 65,
                'stock_min' => 10,
                'unit' => 'Pcs',
            ],
            [
                'cat' => 'Gadget & Elektronik',
                'name' => 'TechZone Braided Fast Charging Cable Type-C 2M',
                'sku' => 'TZ-CABLE-TYPEC',
                'price_buy' => 14000,
                'price_sell' => 49000,
                'stock' => 450,
                'stock_min' => 25,
                'unit' => 'Pcs',
            ],
            [
                'cat' => 'Fashion & Apparel',
                'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt',
                'sku' => 'ST-OVERSIZE-TEE',
                'price_buy' => 45000,
                'price_sell' => 129000,
                'stock' => 520,
                'stock_min' => 30,
                'unit' => 'Pcs',
            ],
            [
                'cat' => 'Fashion & Apparel',
                'name' => 'StyleStudio Vintage Oversized Denim Jacket',
                'sku' => 'ST-DENIM-JACKET',
                'price_buy' => 135000,
                'price_sell' => 289000,
                'stock' => 84,
                'stock_min' => 10,
                'unit' => 'Pcs',
            ],
            [
                'cat' => 'Sembako & Daily Needs',
                'name' => 'Beras Pandan Wangi Premium 5kg',
                'sku' => 'BERAS-PW-5KG',
                'price_buy' => 62000,
                'price_sell' => 78000,
                'stock' => 50,
                'stock_min' => 10,
                'unit' => 'Pack',
            ],
            [
                'cat' => 'Sembako & Daily Needs',
                'name' => 'Minyak Goreng Bimoli Spesial 2L',
                'sku' => 'MINYAK-BIMOLI-2L',
                'price_buy' => 32000,
                'price_sell' => 38500,
                'stock' => 75,
                'stock_min' => 15,
                'unit' => 'Botol',
            ],
        ];

        $retailProductModels = [];
        foreach ($productsData as $p) {
            $retailProductModels[] = RetailProduct::updateOrCreate(
                ['tenant_id' => $tenantId, 'sku' => $p['sku']],
                [
                    'category_id' => $catModels[$p['cat']]->id,
                    'name' => $p['name'],
                    'unit' => $p['unit'],
                    'stock' => $p['stock'],
                    'stock_min' => $p['stock_min'],
                    'price_buy' => $p['price_buy'],
                    'price_sell' => $p['price_sell'],
                ]
            );
        }

        // 10. Retail Master: Customers (15 Pelanggan)
        $customersData = [
            ['name' => 'Budi Santoso', 'contact' => '081298765431', 'tier' => 'member'],
            ['name' => 'Anisa Rahmawati', 'contact' => '081298765432', 'tier' => 'member'],
            ['name' => 'Dina Permata', 'contact' => '081398765433', 'tier' => 'member'],
            ['name' => 'Eko Prasetyo', 'contact' => '081398765434', 'tier' => 'regular'],
            ['name' => 'Fajar Hidayat', 'contact' => '081498765435', 'tier' => 'regular'],
            ['name' => 'Gita Gutawa', 'contact' => '081598765436', 'tier' => 'member'],
            ['name' => 'Hendra Setiawan', 'contact' => '081698765437', 'tier' => 'regular'],
            ['name' => 'Indah Kusuma', 'contact' => '081798765438', 'tier' => 'member'],
            ['name' => 'Joko Widodo', 'contact' => '081898765439', 'tier' => 'regular'],
            ['name' => 'Kartika Sari', 'contact' => '081998765440', 'tier' => 'member'],
            ['name' => 'Lukman Hakim', 'contact' => '082198765441', 'tier' => 'regular'],
            ['name' => 'Mega Utami', 'contact' => '082298765442', 'tier' => 'regular'],
            ['name' => 'Naufal Rizky', 'contact' => '082398765443', 'tier' => 'member'],
            ['name' => 'Olivia Putri', 'contact' => '082498765444', 'tier' => 'regular'],
            ['name' => 'Pratama Arhan', 'contact' => '082598765445', 'tier' => 'member'],
        ];
        $customerIds = [];
        foreach ($customersData as $cd) {
            $cust = RetailCustomer::updateOrCreate(
                ['tenant_id' => $tenantId, 'contact' => $cd['contact']],
                ['name' => $cd['name'], 'tier' => $cd['tier']]
            );
            $customerIds[] = $cust->id;
        }

        // 11. Retail Master: Suppliers (5 Supplier)
        $suppliersData = [
            ['name' => 'PT Kosmetik Mandiri Indonesia', 'contact' => '021-55443322', 'address' => 'Kawasan Industri Pulogadung, Jakarta Timur'],
            ['name' => 'PT Mega Gadget Nusantara', 'contact' => '021-66778899', 'address' => 'Mangga Dua Square Blok F No. 12, Jakarta Utara'],
            ['name' => 'CV Garmen Maju Jaya', 'contact' => '022-77889900', 'address' => 'Jl. Cigondewah Kaler No. 45, Bandung'],
            ['name' => 'PT Distributor Sembako Bersama', 'contact' => '021-88990011', 'address' => 'Pasar Induk Cipinang Blok A No. 5, Jakarta Timur'],
            ['name' => 'PT Logistik Kemasan Prima', 'contact' => '021-99001122', 'address' => 'Kawasan Industri Jababeka Cikarang, Bekasi'],
        ];
        $supplierIds = [];
        foreach ($suppliersData as $sd) {
            $sup = RetailSupplier::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $sd['name']],
                ['contact' => $sd['contact'], 'address' => $sd['address']]
            );
            $supplierIds[] = $sup->id;
        }

        // 12. Retail Master: Discounts & Pricelist
        RetailDiscount::firstOrCreate(
            ['tenant_id' => $tenantId, 'code' => 'DISKON10'],
            [
                'name' => 'Diskon 10% Spesial',
                'type' => 'percentage',
                'value' => 10,
                'min_purchase' => 50000,
                'is_active' => true,
                'starts_at' => Carbon::now()->subMonths(2),
                'expires_at' => Carbon::now()->addMonths(2),
            ]
        );
        RetailDiscount::firstOrCreate(
            ['tenant_id' => $tenantId, 'code' => 'GAJIANHEMAT'],
            [
                'name' => 'Potongan 25rb Promo Gajian',
                'type' => 'fixed',
                'value' => 25000,
                'min_purchase' => 200000,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(5),
                'expires_at' => Carbon::now()->addDays(10),
            ]
        );

        $pricelist = RetailPricelist::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Harga Member VIP'],
            ['type' => 'member']
        );
        foreach (array_slice($retailProductModels, 0, 5) as $prod) {
            RetailPricelistItem::updateOrCreate(
                ['pricelist_id' => $pricelist->id, 'product_id' => $prod->id],
                ['price' => round($prod->price_sell * 0.9)]
            );
        }

        // 13. Retail Master: Finance Categories
        $expCatNames = ['Listrik & Air', 'Gaji Karyawan', 'Biaya Iklan Shopee & TikTok Ads', 'Biaya Packing & Lakban', 'Sewa Gudang & Kebersihan'];
        $expenseCatIds = [];
        foreach ($expCatNames as $cn) {
            $c = RetailFinanceCategory::firstOrCreate(['tenant_id' => $tenantId, 'name' => $cn, 'type' => 'expense']);
            $expenseCatIds[] = $c->id;
        }

        $incCatNames = ['Penjualan Toko Offline', 'Settlement Marketplace', 'Cashback Ekspedisi & Ongkir', 'Pendapatan Lain-lain'];
        $incomeCatIds = [];
        foreach ($incCatNames as $cn) {
            $c = RetailFinanceCategory::firstOrCreate(['tenant_id' => $tenantId, 'name' => $cn, 'type' => 'income']);
            $incomeCatIds[] = $c->id;
        }

        // 14. Roles & Staff
        $rolesData = [
            [
                'name' => 'Owner / General Manager',
                'permissions' => [
                    'seller_marketplace', 'seller_orders', 'seller_mapping', 'seller_sync',
                    'seller_shipping', 'seller_packing', 'seller_warehouses', 'seller_notifications',
                    'pos', 'catalog', 'inventory', 'finance', 'reports', 'staff', 'roles', 'settings',
                ],
            ],
            [
                'name' => 'Admin Operasional Marketplace',
                'permissions' => [
                    'seller_marketplace', 'seller_orders', 'seller_mapping', 'seller_sync',
                    'seller_notifications', 'catalog', 'reports',
                ],
            ],
            [
                'name' => 'Kasir Toko Offline',
                'permissions' => [
                    'pos', 'pos_transactions', 'pos_shifts', 'customer_returns',
                ],
            ],
            [
                'name' => 'Staff Gudang & Logistik',
                'permissions' => [
                    'seller_warehouses', 'seller_shipping', 'seller_packing',
                    'inventory', 'stock_opname', 'stock_transfers',
                ],
            ],
            [
                'name' => 'Finance & Settlement',
                'permissions' => [
                    'finance', 'cash_transfers', 'payables', 'receivables', 'cash_flow', 'tax_report', 'reports',
                ],
            ],
        ];

        $roleModels = [];
        foreach ($rolesData as $rd) {
            $roleModels[$rd['name']] = RetailRole::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $rd['name']],
                ['permissions' => $rd['permissions']]
            );
        }

        $kasirRoleId = $roleModels['Kasir Toko Offline']->id ?? null;
        $gudangRoleId = $roleModels['Staff Gudang & Logistik']->id ?? null;

        $staffUsers = [
            [
                'email' => 'siti.kasir.make@example.com',
                'name' => 'Siti Ramadhani',
                'role' => 'staff',
                'status' => 'active',
                'tenant_id' => $tenantId,
                'retail_role_id' => $kasirRoleId,
                'password' => Hash::make('password123'),
            ],
            [
                'email' => 'rian.kasir.make@example.com',
                'name' => 'Rian Pratama',
                'role' => 'staff',
                'status' => 'active',
                'tenant_id' => $tenantId,
                'retail_role_id' => $kasirRoleId,
                'password' => Hash::make('password123'),
            ],
            [
                'email' => 'dimas.gudang.make@example.com',
                'name' => 'Dimas Logistik',
                'role' => 'staff',
                'status' => 'active',
                'tenant_id' => $tenantId,
                'retail_role_id' => $gudangRoleId,
                'password' => Hash::make('password123'),
            ],
        ];

        $staffModels = [];
        foreach ($staffUsers as $su) {
            $staffModels[] = User::updateOrCreate(['email' => $su['email']], $su);
        }

        // 15. Omnichannel: Multi-Gudang (SellerWarehouses)
        $warehouses = [
            [
                'name' => 'Gudang Utama Jakarta',
                'code' => 'WH-JKT-01',
                'city' => 'Jakarta Barat',
                'address' => 'Kawasan Industri Pergudangan Daan Mogot Km 14 No. 8, Cengkareng',
                'pic_name' => 'Dimas Logistik',
                'pic_phone' => '081299881122',
                'is_default' => true,
            ],
            [
                'name' => 'Gudang Hub Surabaya',
                'code' => 'WH-SBY-02',
                'city' => 'Surabaya',
                'address' => 'Rungkut Industri III No. 45, Rungkut, Surabaya',
                'pic_name' => 'Ahmad Subagyo',
                'pic_phone' => '085611223344',
                'is_default' => false,
            ],
            [
                'name' => 'Gudang Transit Bandung',
                'code' => 'WH-BDG-03',
                'city' => 'Bandung',
                'address' => 'Jl. Soekarno Hatta No. 512, Batununggal, Bandung',
                'pic_name' => 'Dedi Mulyadi',
                'pic_phone' => '081399887766',
                'is_default' => false,
            ],
            [
                'name' => 'Gudang Fulfillment Medan',
                'code' => 'WH-MDN-04',
                'city' => 'Medan',
                'address' => 'KIM II Kavling 18 Mabar, Medan Deli, Medan',
                'pic_name' => 'Zulkifli Harahap',
                'pic_phone' => '082155443322',
                'is_default' => false,
            ],
        ];
        foreach ($warehouses as $wh) {
            SellerWarehouse::create(array_merge($wh, ['tenant_id' => $tenantId]));
        }

        // 16. Omnichannel: Marketplace Channels
        $channels = [
            [
                'platform' => 'shopee',
                'store_name' => 'MakeProject Official Store (Shopee)',
                'account_id' => 'SHP_MAKEPROJECT_8892',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 15,
                'last_sync_at' => Carbon::now()->subMinutes(3),
            ],
            [
                'platform' => 'tokopedia',
                'store_name' => 'MakeProject Tech & Beauty (Tokopedia)',
                'account_id' => 'TKP_MAKEPROJECT_9912',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 15,
                'last_sync_at' => Carbon::now()->subMinutes(8),
            ],
            [
                'platform' => 'tiktok',
                'store_name' => 'MakeProject Lifestyle (TikTok Shop)',
                'account_id' => 'TT_MAKEPROJECT_7731',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 30,
                'last_sync_at' => Carbon::now()->subMinutes(14),
            ],
            [
                'platform' => 'lazada',
                'store_name' => 'MakeProject Flagship Store (Lazada)',
                'account_id' => 'LZD_MAKEPROJECT_4410',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 60,
                'last_sync_at' => Carbon::now()->subHours(1),
            ],
        ];
        foreach ($channels as $ch) {
            SellerChannel::create(array_merge($ch, ['tenant_id' => $tenantId]));
        }

        // 17. Omnichannel: Seller Products & Marketplace Mapping
        $sellerProducts = [
            [
                'name' => 'GlowUp Vitamin C Brightening Serum 30ml',
                'sku' => 'GLOW-SERUM-30',
                'category' => 'Beauty & Skincare',
                'price' => 135000,
                'cost_price' => 42000,
                'stock' => 342,
                'min_stock' => 20,
                'weight_gram' => 120,
                'image_url' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80',
                'description' => 'Serum pencerah wajah dengan 10% Vitamin C dan Niacinamide murni.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-GLOW-30',
                    'tokopedia' => 'TKP-GLOW-30',
                    'tiktok' => 'TT-GLOW-30',
                    'lazada' => 'LZD-GLOW-30',
                ],
            ],
            [
                'name' => 'GlowUp UV Shield Sunscreen SPF 50 PA++++',
                'sku' => 'GLOW-SUNSCREEN-50',
                'category' => 'Beauty & Skincare',
                'price' => 95000,
                'cost_price' => 31000,
                'stock' => 185,
                'min_stock' => 15,
                'weight_gram' => 80,
                'image_url' => 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&auto=format&fit=crop&q=80',
                'description' => 'Sunscreen ringan tanpa whitecast dengan broad spectrum UV filters.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-SUN-50',
                    'tokopedia' => 'TKP-SUN-50-DIFF',
                    'tiktok' => null,
                    'lazada' => 'LZD-SUN-50',
                ],
            ],
            [
                'name' => 'TechZone Noise Cancelling Wireless Headset Pro',
                'sku' => 'TZ-HEADSET-PRO',
                'category' => 'Electronics & Gadget',
                'price' => 489000,
                'cost_price' => 195000,
                'stock' => 48,
                'min_stock' => 10,
                'weight_gram' => 350,
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
                'description' => 'Headset nirkabel dengan Active Noise Cancelling hingga 35dB dan baterai 40 jam.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-HEADSET-PRO',
                    'tokopedia' => 'TKP-HEADSET-PRO',
                    'tiktok' => 'TT-HEADSET-PRO',
                    'lazada' => 'LZD-HEADSET-PRO',
                ],
            ],
            [
                'name' => 'TechZone Fast Charge Powerbank 20.000mAh 65W',
                'sku' => 'TZ-POWERBANK-20K',
                'category' => 'Electronics & Gadget',
                'price' => 299000,
                'cost_price' => 110000,
                'stock' => 65,
                'min_stock' => 10,
                'weight_gram' => 420,
                'image_url' => 'https://images.unsplash.com/photo-1609592807527-85028e08d660?w=300&auto=format&fit=crop&q=80',
                'description' => 'Powerbank kapasitas besar dengan port Type-C PD 65W untuk laptop & smartphone.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-PB-20K',
                    'tokopedia' => 'TKP-PB-20K',
                    'tiktok' => 'TT-PB-20K',
                    'lazada' => 'LZD-PB-20K',
                ],
            ],
            [
                'name' => 'TechZone Braided Fast Charging Cable Type-C 2M',
                'sku' => 'TZ-CABLE-TYPEC',
                'category' => 'Electronics & Gadget',
                'price' => 49000,
                'cost_price' => 14000,
                'stock' => 450,
                'min_stock' => 25,
                'weight_gram' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
                'description' => 'Kabel data nilon kepang anti putus fast charging 100W PD.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-CBL-TC',
                    'tokopedia' => 'TKP-CBL-TC',
                    'tiktok' => 'TT-CBL-TC',
                    'lazada' => 'LZD-CBL-TC',
                ],
            ],
            [
                'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt',
                'sku' => 'ST-OVERSIZE-TEE',
                'category' => 'Fashion & Apparel',
                'price' => 129000,
                'cost_price' => 45000,
                'stock' => 520,
                'min_stock' => 30,
                'weight_gram' => 240,
                'image_url' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
                'description' => 'Kaos oversized bahan katun 24s gramasi tebal premium.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => null,
                    'tokopedia' => null,
                    'tiktok' => 'TT-TEE-OS',
                    'lazada' => null,
                ],
            ],
            [
                'name' => 'StyleStudio Vintage Oversized Denim Jacket',
                'sku' => 'ST-DENIM-JACKET',
                'category' => 'Fashion & Apparel',
                'price' => 289000,
                'cost_price' => 135000,
                'stock' => 84,
                'min_stock' => 10,
                'weight_gram' => 650,
                'image_url' => 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&auto=format&fit=crop&q=80',
                'description' => 'Jaket denim tebal 14oz wash vintage dengan potongan boxy fit.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => null,
                    'tokopedia' => 'TKP-JACKET-DNM',
                    'tiktok' => 'TT-JACKET-DNM',
                    'lazada' => null,
                ],
            ],
            [
                'name' => 'GlowUp Gentle Hydrating Facial Cleanser 100ml',
                'sku' => 'GLOW-CLEANSER-100',
                'category' => 'Beauty & Skincare',
                'price' => 79000,
                'cost_price' => 25000,
                'stock' => 210,
                'min_stock' => 15,
                'weight_gram' => 140,
                'image_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
                'description' => 'Pembersih wajah pH balanced dengan Hyaluronic Acid dan Ceramide.',
                'status' => 'Aktif',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-CLN-100',
                    'tokopedia' => 'TKP-CLN-100',
                    'tiktok' => null,
                    'lazada' => null,
                ],
            ],
        ];
        foreach ($sellerProducts as $sp) {
            SellerProduct::create(array_merge($sp, ['tenant_id' => $tenantId]));
        }

        // 18. Omnichannel: Sync Logs
        $syncLogs = [
            [
                'platform' => 'shopee',
                'sync_type' => 'Stok & Harga',
                'status' => 'Success',
                'items_count' => 8,
                'message' => 'Semua 8 SKU master berhasil disinkronkan ke Shopee tanpa kendala.',
                'created_at' => Carbon::now()->subMinutes(3),
            ],
            [
                'platform' => 'tokopedia',
                'sync_type' => 'Tarik Pesanan Baru',
                'status' => 'Success',
                'items_count' => 15,
                'message' => '15 pesanan baru berhasil di-fetch dari webhook Tokopedia.',
                'created_at' => Carbon::now()->subMinutes(8),
            ],
            [
                'platform' => 'tiktok',
                'sync_type' => 'Stok & Variasi',
                'status' => 'Success',
                'items_count' => 6,
                'message' => 'Sinkronisasi stok kampanye TikTok Shop berhasil terupdate.',
                'created_at' => Carbon::now()->subMinutes(14),
            ],
            [
                'platform' => 'lazada',
                'sync_type' => 'Katalog Produk',
                'status' => 'Success',
                'items_count' => 5,
                'message' => 'Harga promo Mega Sale Lazada berhasil diterapkan.',
                'created_at' => Carbon::now()->subHours(1),
            ],
            [
                'platform' => 'shopee',
                'sync_type' => 'Update Status Resi (AWB)',
                'status' => 'Success',
                'items_count' => 12,
                'message' => '12 nomor resi J&T Express & SPX berhasil dikirimkan ke Shopee.',
                'created_at' => Carbon::now()->subHours(2),
            ],
        ];
        foreach ($syncLogs as $sl) {
            SellerSyncLog::create(array_merge($sl, ['tenant_id' => $tenantId]));
        }

        // 19. Generate 30 Hari Transaksi Kasir POS, Shifts, Expenses, Purchases
        $this->command?->info("Generating 30 days of transactions, shifts, orders & finance...");

        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();
        $currDate = clone $startDate;

        $fakerPaymentMethods = ['CASH', 'QRIS', 'TRANSFER', 'CASH', 'QRIS'];
        $taxRate = 0.11; // PPN 11%

        while ($currDate <= $endDate) {
            $isToday = $currDate->isToday();

            // A. Shifts (Shift Pagi 08:00-14:00 & Shift Siang 14:00-21:30)
            $pagiStart = (clone $currDate)->startOfDay()->addHours(8);
            $pagiEnd = (clone $currDate)->startOfDay()->addHours(14);
            $pagiSales = rand(1200000, 2800000);
            $pagiVar = rand(0, 3) === 0 ? -rand(2000, 10000) : 0;

            RetailShift::create([
                'tenant_id' => $tenantId,
                'user_id' => $staffModels[0]->id,
                'opened_at' => $pagiStart,
                'closed_at' => $pagiEnd,
                'opening_cash' => 500000,
                'expected_cash' => 500000 + $pagiSales,
                'closing_cash' => 500000 + $pagiSales + $pagiVar,
                'difference' => $pagiVar,
                'status' => 'closed',
                'note' => 'Shift pagi berjalan lancar',
                'created_at' => $pagiStart,
                'updated_at' => $pagiEnd,
            ]);

            $siangStart = (clone $currDate)->startOfDay()->addHours(14);
            $siangEnd = (clone $currDate)->startOfDay()->addHours(21)->addMinutes(30);
            $siangSales = rand(1800000, 3900000);
            $siangVar = rand(0, 4) === 0 ? -rand(5000, 15000) : 0;

            RetailShift::create([
                'tenant_id' => $tenantId,
                'user_id' => $staffModels[1]->id,
                'opened_at' => $siangStart,
                'closed_at' => $isToday ? null : $siangEnd,
                'opening_cash' => 500000,
                'expected_cash' => $isToday ? 0 : (500000 + $siangSales),
                'closing_cash' => $isToday ? 0 : (500000 + $siangSales + $siangVar),
                'difference' => $isToday ? 0 : $siangVar,
                'status' => $isToday ? 'open' : 'closed',
                'note' => $isToday ? 'Shift siang toko aktif berjalan' : 'Shift siang tutup kasir',
                'created_at' => $siangStart,
                'updated_at' => $isToday ? $siangStart : $siangEnd,
            ]);

            // B. POS Offline Transactions (8 - 14 transaksi per hari)
            $dailyTrxCount = rand(8, 14);
            for ($i = 0; $i < $dailyTrxCount; $i++) {
                $trxTime = (clone $currDate)->startOfDay()
                    ->addHours(rand(8, 20))
                    ->addMinutes(rand(0, 59))
                    ->addSeconds(rand(0, 59));

                if ($trxTime > Carbon::now()) continue;

                $paymentMethod = (rand(1, 100) <= 6) ? 'PIUTANG' : $fakerPaymentMethods[array_rand($fakerPaymentMethods)];
                $isPaid = ($paymentMethod !== 'PIUTANG');
                $custId = (rand(1, 100) <= 60 || $paymentMethod === 'PIUTANG') ? $customerIds[array_rand($customerIds)] : null;
                $cashierUser = (rand(0, 1) === 0) ? $staffModels[0] : $staffModels[1];

                $invNo = 'INV-' . $trxTime->format('Ymd') . '-' . rand(1000, 9999);

                $trx = RetailTransaction::create([
                    'tenant_id' => $tenantId,
                    'customer_id' => $custId,
                    'user_id' => $cashierUser->id,
                    'invoice_no' => $invNo,
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'change_amount' => 0,
                    'tax_amount' => 0,
                    'discount_amount' => 0,
                    'payment_method' => $paymentMethod,
                    'status' => $isPaid ? 'paid' : 'unpaid',
                    'created_at' => $trxTime,
                    'updated_at' => $trxTime,
                ]);

                // 1 - 4 items per transaction
                $itemCount = rand(1, 4);
                $subtotal = 0;
                $pickedProducts = array_rand($retailProductModels, $itemCount);
                if (!is_array($pickedProducts)) $pickedProducts = [$pickedProducts];

                foreach ($pickedProducts as $pIdx) {
                    $prod = $retailProductModels[$pIdx];
                    $qty = rand(1, 3);
                    $lineTotal = $prod->price_sell * $qty;
                    $subtotal += $lineTotal;

                    RetailTransactionItem::create([
                        'transaction_id' => $trx->id,
                        'product_id' => $prod->id,
                        'qty' => $qty,
                        'price' => $prod->price_sell,
                        'cost_price' => $prod->price_buy,
                        'subtotal' => $lineTotal,
                        'created_at' => $trxTime,
                        'updated_at' => $trxTime,
                    ]);
                }

                $taxAmount = rand(0, 1) === 1 ? round($subtotal * $taxRate) : 0;
                $finalTotal = $subtotal + $taxAmount;

                $paidAmount = $finalTotal;
                $changeAmount = 0;
                if ($paymentMethod === 'CASH') {
                    $denom = ceil($finalTotal / 50000) * 50000;
                    $paidAmount = max($finalTotal, $denom);
                    $changeAmount = $paidAmount - $finalTotal;
                }

                $trx->update([
                    'total_amount' => $finalTotal,
                    'paid_amount' => $isPaid ? $paidAmount : 0,
                    'change_amount' => $changeAmount,
                    'tax_amount' => $taxAmount,
                ]);

                if ($isPaid) {
                    RetailTransactionPayment::create([
                        'transaction_id' => $trx->id,
                        'amount' => $finalTotal,
                        'payment_method' => $paymentMethod,
                        'created_at' => $trxTime,
                        'updated_at' => $trxTime,
                    ]);
                } else {
                    RetailReceivable::create([
                        'tenant_id' => $tenantId,
                        'transaction_id' => $trx->id,
                        'customer_id' => $trx->customer_id,
                        'total_amount' => $finalTotal,
                        'paid_amount' => 0,
                        'due_date' => $trxTime->copy()->addDays(14)->format('Y-m-d'),
                        'status' => 'unpaid',
                        'created_at' => $trxTime,
                        'updated_at' => $trxTime,
                    ]);
                }
            }

            // C. Operasional: Pengeluaran rutin (2-3 kali seminggu)
            if (rand(1, 10) <= 4) {
                $expAmount = rand(50000, 450000);
                RetailExpense::create([
                    'tenant_id' => $tenantId,
                    'finance_category_id' => $expenseCatIds[array_rand($expenseCatIds)],
                    'user_id' => $user->id,
                    'nominal' => $expAmount,
                    'keterangan' => 'Biaya operasional & perlengkapan toko/packing',
                    'tanggal' => $currDate->format('Y-m-d'),
                    'created_at' => $currDate->copy()->addHours(11),
                    'updated_at' => $currDate->copy()->addHours(11),
                ]);
            }

            // D. Operasional: Pendapatan Lain (1 kali seminggu)
            if ($currDate->dayOfWeek === 5) {
                RetailIncome::create([
                    'tenant_id' => $tenantId,
                    'finance_category_id' => $incomeCatIds[2], // Cashback ekspedisi
                    'user_id' => $user->id,
                    'nominal' => rand(150000, 500000),
                    'keterangan' => 'Klaim cashback ekspedisi J&T & SiCepat mingguan',
                    'tanggal' => $currDate->format('Y-m-d'),
                    'created_at' => $currDate->copy()->addHours(16),
                    'updated_at' => $currDate->copy()->addHours(16),
                ]);
            }

            // E. Purchase Orders (Restock Supplier) - Setiap Senin & Kamis
            if (in_array($currDate->dayOfWeek, [1, 4])) {
                $supId = $supplierIds[array_rand($supplierIds)];
                $poCost = rand(1500000, 5000000);
                $poStatus = (rand(0, 1) === 1) ? 'paid' : 'unpaid';

                $purchase = RetailPurchase::create([
                    'tenant_id' => $tenantId,
                    'supplier_id' => $supId,
                    'total_cost' => $poCost,
                    'purchase_date' => $currDate->format('Y-m-d'),
                    'notes' => 'PO-' . $currDate->format('Ymd') . '-' . rand(100, 999),
                    'status' => 'received',
                    'created_at' => $currDate->copy()->addHours(10),
                    'updated_at' => $currDate->copy()->addHours(10),
                ]);

                // Item purchase
                $poProd = $retailProductModels[array_rand($retailProductModels)];
                RetailPurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $poProd->id,
                    'qty' => rand(15, 50),
                    'cost_per_item' => $poProd->price_buy,
                    'subtotal' => $poCost,
                    'created_at' => $currDate->copy()->addHours(10),
                    'updated_at' => $currDate->copy()->addHours(10),
                ]);

                if ($poStatus === 'unpaid') {
                    RetailPayable::create([
                        'tenant_id' => $tenantId,
                        'supplier_id' => $supId,
                        'purchase_id' => $purchase->id,
                        'total_amount' => $poCost,
                        'paid_amount' => 0,
                        'due_date' => $currDate->copy()->addDays(21)->format('Y-m-d'),
                        'status' => 'unpaid',
                        'created_at' => $currDate->copy()->addHours(10),
                        'updated_at' => $currDate->copy()->addHours(10),
                    ]);
                }
            }

            $currDate->addDay();
        }

        // 20. Omnichannel: 45 Pesanan Marketplace Realistis
        $this->command?->info("Generating 45 omnichannel marketplace orders...");

        $orderTemplates = [
            [
                'platform' => 'shopee',
                'customer_name' => 'Anisa Rahmawati',
                'customer_phone' => '081234567890',
                'customer_address' => 'Jl. Melati No. 45, Kebayoran Baru, Jakarta Selatan 12110',
                'courier' => 'J&T Express',
                'payment_method' => 'ShopeePay',
                'items' => [
                    ['sku' => 'GLOW-SERUM-30', 'name' => 'GlowUp Vitamin C Brightening Serum 30ml', 'qty' => 2, 'price' => 135000],
                    ['sku' => 'GLOW-SUNSCREEN-50', 'name' => 'GlowUp UV Shield Sunscreen SPF 50 PA++++', 'qty' => 1, 'price' => 95000],
                ],
                'notes' => 'Tolong bubble wrap tebal ya min, terima kasih!',
            ],
            [
                'platform' => 'tokopedia',
                'customer_name' => 'Budi Santoso',
                'customer_phone' => '085712348899',
                'customer_address' => 'Griya Asri Blok C2 No 12, Rungkut, Surabaya, Jawa Timur',
                'courier' => 'SiCepat REG',
                'payment_method' => 'GoPay',
                'items' => [
                    ['sku' => 'TZ-HEADSET-PRO', 'name' => 'TechZone Noise Cancelling Wireless Headset Pro', 'qty' => 1, 'price' => 489000],
                ],
                'notes' => 'Warna Matte Black',
            ],
            [
                'platform' => 'tiktok',
                'customer_name' => 'Dina Permata',
                'customer_phone' => '087899001122',
                'customer_address' => 'Jl. Sunda No. 88, Sumurbandung, Bandung, Jawa Barat',
                'courier' => 'Ninja Xpress',
                'payment_method' => 'TikTok PayIn',
                'items' => [
                    ['sku' => 'ST-OVERSIZE-TEE', 'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt', 'qty' => 2, 'price' => 129000],
                ],
                'notes' => 'Sage Green XL',
            ],
            [
                'platform' => 'lazada',
                'customer_name' => 'Eko Prasetyo',
                'customer_phone' => '081388776655',
                'customer_address' => 'Komp. Mediterania Residence No 10B, Semarang Barat, Semarang',
                'courier' => 'Lazada Express (LEL)',
                'payment_method' => 'Lazada Wallet',
                'items' => [
                    ['sku' => 'GLOW-SERUM-30', 'name' => 'GlowUp Vitamin C Brightening Serum 30ml', 'qty' => 1, 'price' => 135000],
                ],
                'notes' => null,
            ],
            [
                'platform' => 'shopee',
                'customer_name' => 'Ahmad Ramadhan',
                'customer_phone' => '081223344556',
                'customer_address' => 'Jl. Merdeka No. 1, Bandung, Jawa Barat',
                'courier' => 'Shopee Xpress Standard',
                'payment_method' => 'ShopeePay',
                'items' => [
                    ['sku' => 'TZ-POWERBANK-20K', 'name' => 'TechZone Fast Charge Powerbank 20.000mAh 65W', 'qty' => 1, 'price' => 299000],
                ],
                'notes' => 'Space Gray',
            ],
            [
                'platform' => 'tokopedia',
                'customer_name' => 'Siti Aminah',
                'customer_phone' => '085777888999',
                'customer_address' => 'Komp. Polri, Pasar Minggu, Jakarta Selatan',
                'courier' => 'SiCepat BEST',
                'payment_method' => 'OVO',
                'items' => [
                    ['sku' => 'TZ-HEADSET-PRO', 'name' => 'TechZone Noise Cancelling Wireless Headset Pro', 'qty' => 1, 'price' => 489000],
                    ['sku' => 'TZ-CABLE-TYPEC', 'name' => 'TechZone Braided Fast Charging Cable Type-C 2M', 'qty' => 2, 'price' => 49000],
                ],
                'notes' => 'White',
            ],
            [
                'platform' => 'tiktok',
                'customer_name' => 'Joko Widodo',
                'customer_phone' => '081122334455',
                'customer_address' => 'Jl. Slamet Riyadi No. 100, Solo, Jawa Tengah',
                'courier' => 'J&T Express',
                'payment_method' => 'COD (Bayar di Tempat)',
                'items' => [
                    ['sku' => 'ST-OVERSIZE-TEE', 'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt', 'qty' => 3, 'price' => 129000],
                ],
                'notes' => 'Black L',
            ],
            [
                'platform' => 'shopee',
                'customer_name' => 'Nadia Salsabila',
                'customer_phone' => '085611223344',
                'customer_address' => 'Jl. Diponegoro No. 25, Yogyakarta',
                'courier' => 'J&T Express',
                'payment_method' => 'ShopeePay',
                'items' => [
                    ['sku' => 'GLOW-SUNSCREEN-50', 'name' => 'GlowUp UV Shield Sunscreen SPF 50 PA++++', 'qty' => 2, 'price' => 95000],
                    ['sku' => 'GLOW-CLEANSER-100', 'name' => 'GlowUp Gentle Hydrating Facial Cleanser 100ml', 'qty' => 1, 'price' => 79000],
                ],
                'notes' => 'Kado ultah, mohon kirim hari ini ya',
            ],
        ];

        for ($k = 0; $k < 45; $k++) {
            $tpl = $orderTemplates[$k % count($orderTemplates)];
            $orderDay = Carbon::now()->subDays(floor($k * 30 / 45))->subHours(rand(1, 12));
            
            $items = $tpl['items'];
            $itemsTotal = array_reduce($items, fn($sum, $item) => $sum + ($item['qty'] * $item['price']), 0);
            $shippingCost = rand(10000, 25000);

            $status = 'Selesai';
            if ($k < 5) {
                $status = 'Perlu Dikirim';
            } elseif ($k < 12) {
                $status = 'Dikirim';
            }

            $orderNo = strtoupper(substr($tpl['platform'], 0, 3)) . '-' . $orderDay->format('ymd') . '-' . rand(10000, 99999);
            $trackingNo = strtoupper(substr($tpl['courier'], 0, 2)) . rand(1000000000, 9999999999);

            SellerOrder::create([
                'tenant_id' => $tenantId,
                'order_no' => $orderNo,
                'platform' => $tpl['platform'],
                'customer_name' => $tpl['customer_name'],
                'customer_phone' => $tpl['customer_phone'],
                'customer_address' => $tpl['customer_address'],
                'courier' => $tpl['courier'],
                'tracking_no' => $status === 'Perlu Dikirim' ? null : $trackingNo,
                'status' => $status,
                'total_amount' => $itemsTotal + $shippingCost,
                'shipping_cost' => $shippingCost,
                'payment_method' => $tpl['payment_method'],
                'items' => $items,
                'notes' => $tpl['notes'],
                'order_date' => $orderDay,
                'created_at' => $orderDay,
                'updated_at' => $orderDay,
            ]);
        }

        // 21. Support Tickets
        $tenantCode = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $tenantId));
        $supportTickets = [
            [
                'id' => 'TKT-' . $tenantCode . '-001',
                'tenant_id' => $tenantId,
                'name' => $user->name,
                'subject' => 'Sinkronisasi Stok Flash Sale TikTok Shop sedikit terlambat saat peak hour',
                'description' => 'Halo tim Bizora, kami mendapati kendala saat event Flash Sale TikTok jam 20:00 semalam. Terdapat delay sekitar 3-5 menit sebelum stok berkurang di sistem omnichannel Bizora. Mohon dibantu pengecekan webhook event TikTok Shop toko kami.',
                'category' => 'bug',
                'priority' => 'high',
                'status' => 'in_progress',
                'assigned' => 'Dimas Technical Support',
                'created_at' => Carbon::now()->subDays(1)->subHours(3),
                'updated_at' => Carbon::now()->subHours(2),
            ],
            [
                'id' => 'TKT-' . $tenantCode . '-002',
                'tenant_id' => $tenantId,
                'name' => $user->name,
                'subject' => 'Bagaimana cara mapping varian produk multi-warna & ukuran dari Shopee?',
                'description' => 'Saya ingin menanyakan panduan mapping untuk produk Fashion yang memiliki 2 level variasi (Warna dan Ukuran) agar stok master SKU di gudang pusat Jakarta dapat sinkron otomatis dengan SKU seller Shopee.',
                'category' => 'question',
                'priority' => 'medium',
                'status' => 'resolved',
                'assigned' => 'Nadia Customer Success',
                'created_at' => Carbon::now()->subDays(3)->subHours(5),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'id' => 'TKT-' . $tenantCode . '-003',
                'tenant_id' => $tenantId,
                'name' => $user->name,
                'subject' => 'Usulan penambahan integrasi kurir J&T Cargo & SiCepat Gokil untuk pesanan grosir',
                'description' => 'Apakah di roadmap mendatang bisa ditambahkan integrasi kurir kargo (J&T Cargo / SiCepat Gokil) untuk mendukung pesanan B2B dan reseller yang belanja dalam volume besar (lebih dari 10kg)?',
                'category' => 'feature',
                'priority' => 'low',
                'status' => 'open',
                'assigned' => 'Product Team Bizora',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'id' => 'TKT-' . $tenantCode . '-004',
                'tenant_id' => $tenantId,
                'name' => $user->name,
                'subject' => 'Konfirmasi faktur pajak & bukti potong PPh 23 invoice langganan tahunan',
                'description' => 'Mohon dikirimkan bukti potong PPh 23 dan Faktur Pajak elektronik atas pembayaran tagihan paket langganan tahunan PT Bizora Omnichannel untuk keperluan pelaporan SPT Masa perusahaan kami.',
                'category' => 'billing',
                'priority' => 'medium',
                'status' => 'resolved',
                'assigned' => 'Finance & Tax Team',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(8),
            ],
        ];

        foreach ($supportTickets as $st) {
            SupportTicket::updateOrCreate(['id' => $st['id']], $st);
        }

        $this->command?->info("SUCCESS! Full dummy data for {$this->targetEmail} (Tenant: {$tenantId}) has been completely seeded!");
    }
}
