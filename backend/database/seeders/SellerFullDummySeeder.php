<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use App\Models\RetailRole;
use App\Models\SellerWarehouse;
use App\Models\SellerChannel;
use App\Models\SellerProduct;
use App\Models\SellerOrder;
use App\Models\SellerSyncLog;
use App\Models\RetailShift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SellerFullDummySeeder extends Seeder
{
    public function run()
    {
        // Find all seller demo tenants
        $tenants = Tenant::whereHas('businessCategory', function ($q) {
            $q->where('slug', 'seller')->orWhere('name', 'Seller');
        })->orWhere('tenant_id', 'TN-SELLER')->get();

        if ($tenants->isEmpty()) {
            $cat = \App\Models\BusinessCategory::where('slug', 'seller')->first();
            $user = User::firstOrCreate(
                ['email' => 'seller@demo.com'],
                [
                    'name' => 'Hendra Seller Demo',
                    'password' => Hash::make('password'),
                    'role' => 'customer',
                    'status' => 'active',
                    'business_category_id' => $cat?->id,
                    'tenant_id' => 'TN-SELLER',
                ]
            );

            $tenant = Tenant::firstOrCreate(
                ['tenant_id' => 'TN-SELLER'],
                [
                    'user_id' => $user->id,
                    'name' => 'Hendra Seller Demo',
                    'business_name' => 'Bizora Omnichannel Store',
                    'business_category_id' => $cat?->id,
                    'status' => 'active',
                ]
            );
            $tenants = collect([$tenant]);
        }

        foreach ($tenants as $tenant) {
            $this->runForTenant($tenant->tenant_id, $tenant->name);
        }
    }

    public function runForTenant($tenantId, $tenantName = 'Demo Seller Tenant')
    {
        // 1. Roles & Permissions (Separated Seller Roles)
        $rolesData = [
            [
                'name' => 'Seller Owner / General Manager',
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
                'name' => 'Staff Gudang & Logistik',
                'permissions' => [
                    'seller_warehouses', 'seller_shipping', 'seller_packing',
                    'inventory', 'stock_opname', 'stock_transfers',
                ],
            ],
            [
                'name' => 'Kasir Toko Offline',
                'permissions' => [
                    'pos', 'pos_transactions', 'pos_shifts', 'customer_returns',
                ],
            ],
            [
                'name' => 'Finance & Settlement',
                'permissions' => [
                    'finance', 'cash_transfers', 'payables', 'receivables', 'cash_flow', 'tax_report', 'reports',
                ],
            ],
        ];

        foreach ($rolesData as $rd) {
            RetailRole::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $rd['name']],
                ['permissions' => $rd['permissions']]
            );
        }

        // 2. Multi-Gudang (Seller Warehouses)
        SellerWarehouse::where('tenant_id', $tenantId)->delete();

        $warehouses = [
            [
                'name' => 'Gudang Utama Jakarta',
                'code' => 'WH-JKT-01',
                'city' => 'Jakarta Barat',
                'address' => 'Kawasan Industri Pergudangan Daan Mogot Km 14 No. 8, Cengkareng',
                'pic_name' => 'Rahmat Hidayat',
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

        // 3. Channels Marketplace
        SellerChannel::where('tenant_id', $tenantId)->delete();

        $channels = [
            [
                'platform' => 'shopee',
                'store_name' => 'GlowUp Official Store (Shopee)',
                'account_id' => 'SHP_GLOWUP_9901',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 10,
                'last_sync_at' => Carbon::now()->subMinutes(2),
            ],
            [
                'platform' => 'tokopedia',
                'store_name' => 'TechZone ID Tokopedia',
                'account_id' => 'TKP_TECHZONE_4412',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 15,
                'last_sync_at' => Carbon::now()->subMinutes(5),
            ],
            [
                'platform' => 'tiktok',
                'store_name' => 'StyleStudio Shop (TikTok)',
                'account_id' => 'TTK_STYLESTUDIO_8832',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 10,
                'last_sync_at' => Carbon::now()->subMinutes(12),
            ],
            [
                'platform' => 'lazada',
                'store_name' => 'Bizora Official Store (Lazada)',
                'account_id' => 'LZD_BIZORA_1102',
                'status' => 'connected',
                'auto_sync' => true,
                'sync_interval_mins' => 30,
                'last_sync_at' => Carbon::now()->subMinutes(25),
            ],
            [
                'platform' => 'blibli',
                'store_name' => 'Bizora Official Mall (Blibli)',
                'account_id' => 'BLI_BIZORA_6621',
                'status' => 'disconnected',
                'auto_sync' => false,
                'sync_interval_mins' => 60,
                'last_sync_at' => Carbon::now()->subDays(2),
            ],
        ];

        foreach ($channels as $ch) {
            SellerChannel::create(array_merge($ch, ['tenant_id' => $tenantId]));
        }

        // 4. Products & Multi-Channel Mapping
        SellerProduct::where('tenant_id', $tenantId)->delete();

        $products = [
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
                'stock' => 18,
                'min_stock' => 10,
                'weight_gram' => 350,
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
                'description' => 'Headset nirkabel dengan Active Noise Cancelling hingga 35dB dan baterai 40 jam.',
                'status' => 'Menipis',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-HEADSET-PRO',
                    'tokopedia' => 'TKP-HEADSET-PRO',
                    'tiktok' => 'TT-HEADSET-PRO',
                    'lazada' => 'LZD-HEADSET-PRO',
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
                'name' => 'TechZone Fast Charge Powerbank 20.000mAh 65W',
                'sku' => 'TZ-POWERBANK-20K',
                'category' => 'Electronics & Gadget',
                'price' => 299000,
                'cost_price' => 110000,
                'stock' => 0,
                'min_stock' => 10,
                'weight_gram' => 420,
                'image_url' => 'https://images.unsplash.com/photo-1609592807527-85028e08d660?w=300&auto=format&fit=crop&q=80',
                'description' => 'Powerbank kapasitas besar dengan port Type-C PD 65W untuk laptop & smartphone.',
                'status' => 'Habis',
                'marketplace_mappings' => [
                    'shopee' => 'SHP-PB-20K',
                    'tokopedia' => 'TKP-PB-20K',
                    'tiktok' => 'TT-PB-MISMATCH',
                    'lazada' => 'LZD-PB-20K',
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
        ];

        foreach ($products as $p) {
            SellerProduct::create(array_merge($p, ['tenant_id' => $tenantId]));
        }

        // 5. Orders (Multi-Channel Omnichannel Orders)
        SellerOrder::where('tenant_id', $tenantId)->delete();

        $orders = [
            [
                'order_no' => '260804SHP88219A',
                'platform' => 'shopee',
                'customer_name' => 'Anisa Rahmawati',
                'customer_phone' => '081234567890',
                'customer_address' => 'Jl. Melati No. 45, Kebayoran Baru, Jakarta Selatan 12110',
                'courier' => 'J&T Express',
                'tracking_no' => 'JX9821039821',
                'status' => 'Perlu Dikirim',
                'total_amount' => 358000,
                'shipping_cost' => 18000,
                'payment_method' => 'ShopeePay',
                'items' => [
                    ['sku' => 'GLOW-SERUM-30', 'name' => 'GlowUp Vitamin C Brightening Serum 30ml', 'qty' => 2, 'price' => 135000],
                    ['sku' => 'GLOW-SUNSCREEN-50', 'name' => 'GlowUp UV Shield Sunscreen SPF 50 PA++++', 'qty' => 1, 'price' => 95000],
                ],
                'notes' => 'Tolong bubble wrap tebal ya min, terima kasih!',
                'order_date' => Carbon::now()->subHours(2),
            ],
            [
                'order_no' => 'TKP-20260804-99821',
                'platform' => 'tokopedia',
                'customer_name' => 'Budi Santoso',
                'customer_phone' => '085712348899',
                'customer_address' => 'Griya Asri Blok C2 No 12, Rungkut, Surabaya, Jawa Timur',
                'courier' => 'SiCepat REG',
                'tracking_no' => '003291083921',
                'status' => 'Perlu Dikirim',
                'total_amount' => 459000,
                'shipping_cost' => 0,
                'payment_method' => 'GoPay',
                'items' => [
                    ['sku' => 'TZ-HEADSET-PRO', 'name' => 'TechZone Noise Cancelling Wireless Headset Pro', 'qty' => 1, 'price' => 489000],
                ],
                'notes' => 'Warna Matte Black',
                'order_date' => Carbon::now()->subHours(3),
            ],
            [
                'order_no' => '57821903819203819',
                'platform' => 'tiktok',
                'customer_name' => 'Dina Permata',
                'customer_phone' => '087899001122',
                'customer_address' => 'Jl. Sunda No. 88, Sumurbandung, Bandung, Jawa Barat',
                'courier' => 'Ninja Xpress',
                'tracking_no' => 'NJX882910382',
                'status' => 'Dikirim',
                'total_amount' => 240000,
                'shipping_cost' => 22000,
                'payment_method' => 'TikTok PayIn',
                'items' => [
                    ['sku' => 'ST-OVERSIZE-TEE', 'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt', 'qty' => 2, 'price' => 129000],
                ],
                'notes' => 'Sage Green XL',
                'order_date' => Carbon::now()->subHours(6),
            ],
            [
                'order_no' => 'LZD-882190283',
                'platform' => 'lazada',
                'customer_name' => 'Eko Prasetyo',
                'customer_phone' => '081388776655',
                'customer_address' => 'Komp. Mediterania Residence No 10B, Semarang Barat, Semarang',
                'courier' => 'Lazada Express (LEL)',
                'tracking_no' => 'LEL992019283',
                'status' => 'Selesai',
                'total_amount' => 144000,
                'shipping_cost' => 15000,
                'payment_method' => 'Lazada Wallet',
                'items' => [
                    ['sku' => 'GLOW-SERUM-30', 'name' => 'GlowUp Vitamin C Brightening Serum 30ml', 'qty' => 1, 'price' => 139000],
                ],
                'notes' => null,
                'order_date' => Carbon::now()->subDays(1),
            ],
            [
                'order_no' => '260805SHP99212C',
                'platform' => 'shopee',
                'customer_name' => 'Ahmad Ramadhan',
                'customer_phone' => '081223344556',
                'customer_address' => 'Jl. Merdeka No. 1, Bandung, Jawa Barat',
                'courier' => 'J&T Express',
                'tracking_no' => 'JT9928172019',
                'status' => 'Perlu Dikirim',
                'total_amount' => 312000,
                'shipping_cost' => 15000,
                'payment_method' => 'ShopeePay',
                'items' => [
                    ['sku' => 'TZ-POWERBANK-20K', 'name' => 'TechZone Fast Charge Powerbank 20.000mAh 65W', 'qty' => 1, 'price' => 299000],
                ],
                'notes' => 'Space Gray',
                'order_date' => Carbon::now()->subHours(1),
            ],
            [
                'order_no' => 'TKP-20260805-77312',
                'platform' => 'tokopedia',
                'customer_name' => 'Siti Aminah',
                'customer_phone' => '085777888999',
                'customer_address' => 'Komp. Polri, Pasar Minggu, Jakarta Selatan',
                'courier' => 'SiCepat BEST',
                'tracking_no' => '004291083921',
                'status' => 'Dikirim',
                'total_amount' => 968000,
                'shipping_cost' => 25000,
                'payment_method' => 'OVO',
                'items' => [
                    ['sku' => 'TZ-HEADSET-PRO', 'name' => 'TechZone Noise Cancelling Wireless Headset Pro', 'qty' => 2, 'price' => 489000],
                ],
                'notes' => 'White',
                'order_date' => Carbon::now()->subHours(5),
            ],
            [
                'order_no' => '77821903819203999',
                'platform' => 'tiktok',
                'customer_name' => 'Joko Widodo',
                'customer_phone' => '081122334455',
                'customer_address' => 'Jl. Slamet Riyadi No. 100, Solo, Jawa Tengah',
                'courier' => 'J&T Express',
                'tracking_no' => 'JX9821038888',
                'status' => 'Selesai',
                'total_amount' => 415000,
                'shipping_cost' => 18000,
                'payment_method' => 'COD (Bayar di Tempat)',
                'items' => [
                    ['sku' => 'ST-OVERSIZE-TEE', 'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt', 'qty' => 3, 'price' => 129000],
                ],
                'notes' => 'Black L',
                'order_date' => Carbon::now()->subDays(2),
            ],
            [
                'order_no' => 'ORD-POS-20260805-01',
                'platform' => 'offline_pos',
                'customer_name' => 'Pelanggan Walk-in POS',
                'customer_phone' => '081299998888',
                'customer_address' => 'Toko Offline Flagship Jakarta',
                'courier' => 'Ambil di Toko',
                'tracking_no' => 'POS-STR-001',
                'status' => 'Selesai',
                'total_amount' => 264000,
                'shipping_cost' => 0,
                'payment_method' => 'QRIS BCA',
                'items' => [
                    ['sku' => 'GLOW-SERUM-30', 'name' => 'GlowUp Vitamin C Brightening Serum 30ml', 'qty' => 1, 'price' => 135000],
                    ['sku' => 'ST-OVERSIZE-TEE', 'name' => 'StyleStudio Oversized Heavy Cotton T-Shirt', 'qty' => 1, 'price' => 129000],
                ],
                'notes' => 'Kasir: Siti Ramadhani (Shift Pagi)',
                'order_date' => Carbon::now()->subHours(4),
            ],
        ];

        foreach ($orders as $ord) {
            SellerOrder::create(array_merge($ord, ['tenant_id' => $tenantId]));
        }

        // 6. Sync Logs
        SellerSyncLog::where('tenant_id', $tenantId)->delete();

        $syncLogs = [
            [
                'platform' => 'shopee',
                'sync_type' => 'Stok & Harga',
                'status' => 'Success',
                'items_count' => 34,
                'message' => 'Semua 34 SKU berhasil disinkronkan ke Shopee tanpa kendala.',
                'created_at' => Carbon::now()->subMinutes(2),
            ],
            [
                'platform' => 'tokopedia',
                'sync_type' => 'Tarik Pesanan Baru',
                'status' => 'Success',
                'items_count' => 12,
                'message' => '12 pesanan baru berhasil di-fetch dari webhook Tokopedia.',
                'created_at' => Carbon::now()->subMinutes(5),
            ],
            [
                'platform' => 'tiktok',
                'sync_type' => 'Stok & Variasi',
                'status' => 'Warning',
                'items_count' => 18,
                'message' => '1 SKU gagal update karena sedang terkunci dalam event TikTok Flash Sale.',
                'created_at' => Carbon::now()->subMinutes(12),
            ],
            [
                'platform' => 'lazada',
                'sync_type' => 'Katalog Produk',
                'status' => 'Success',
                'items_count' => 28,
                'message' => 'Sinkronisasi harga kampanye Mega Sale berhasil diterapkan.',
                'created_at' => Carbon::now()->subMinutes(25),
            ],
            [
                'platform' => 'shopee',
                'sync_type' => 'Update Status Resi (AWB)',
                'status' => 'Success',
                'items_count' => 8,
                'message' => '8 nomor resi J&T Express berhasil dikirimkan ke server Shopee.',
                'created_at' => Carbon::now()->subHours(1),
            ],
        ];

        foreach ($syncLogs as $sl) {
            SellerSyncLog::create(array_merge($sl, ['tenant_id' => $tenantId]));
        }

        // 7. Cashier Staff & Retail Shifts (Shift Pagi, Shift Siang, Shift Malam)
        $kasirRole = RetailRole::where('tenant_id', $tenantId)->where('name', 'like', '%Kasir%')->first();
        $roleId = $kasirRole ? $kasirRole->id : null;

        $cashiers = [
            [
                'email' => 'siti.kasir@seller.com',
                'name' => 'Siti Ramadhani',
                'role' => 'staff',
                'status' => 'active',
                'tenant_id' => $tenantId,
                'retail_role_id' => $roleId,
                'password' => Hash::make('password123')
            ],
            [
                'email' => 'rian.kasir@seller.com',
                'name' => 'Rian Pratama',
                'role' => 'staff',
                'status' => 'active',
                'tenant_id' => $tenantId,
                'retail_role_id' => $roleId,
                'password' => Hash::make('password123')
            ],
            [
                'email' => 'budi.kasir@seller.com',
                'name' => 'Budi Setiawan',
                'role' => 'staff',
                'status' => 'active',
                'tenant_id' => $tenantId,
                'retail_role_id' => $roleId,
                'password' => Hash::make('password123')
            ]
        ];

        $cashierModels = [];
        foreach ($cashiers as $c) {
            $cashierModels[] = User::updateOrCreate(
                ['email' => $c['email']],
                $c
            );
        }

        // Seed Retail Shifts for past 25 days
        RetailShift::where('tenant_id', $tenantId)->delete();

        $startDate = Carbon::now()->subDays(25)->startOfDay();
        $endDate = Carbon::now()->startOfDay();
        $currentDate = clone $startDate;

        while ($currentDate < $endDate) {
            // A. Shift Pagi (08:00 - 14:00)
            $pagiStart = (clone $currentDate)->addHours(8);
            $pagiEnd = (clone $currentDate)->addHours(14);
            $pagiSales = rand(1500000, 3200000);
            $pagiVar = rand(-1, 2) == -1 ? -rand(5000, 25000) : (rand(0, 3) == 0 ? rand(5000, 15000) : 0);
            $pagiOpening = 500000;
            $pagiExpected = $pagiOpening + $pagiSales;
            $pagiActual = $pagiExpected + $pagiVar;

            RetailShift::create([
                'tenant_id' => $tenantId,
                'user_id' => $cashierModels[0]->id,
                'opened_at' => $pagiStart,
                'closed_at' => $pagiEnd,
                'opening_cash' => $pagiOpening,
                'expected_cash' => $pagiExpected,
                'closing_cash' => $pagiActual,
                'difference' => $pagiVar,
                'status' => 'closed',
                'note' => 'Shift pagi toko offline berjalan lancar.',
                'created_at' => $pagiStart,
                'updated_at' => $pagiEnd,
            ]);

            // B. Shift Siang (14:00 - 21:30)
            $siangStart = (clone $currentDate)->addHours(14);
            $siangEnd = (clone $currentDate)->addHours(21)->addMinutes(30);
            $siangSales = rand(2200000, 4800000);
            $siangVar = rand(-2, 3) == -1 ? -rand(5000, 20000) : (rand(0, 2) == 0 ? rand(5000, 20000) : 0);
            $siangOpening = 500000;
            $siangExpected = $siangOpening + $siangSales;
            $siangActual = $siangExpected + $siangVar;

            RetailShift::create([
                'tenant_id' => $tenantId,
                'user_id' => $cashierModels[1]->id,
                'opened_at' => $siangStart,
                'closed_at' => $siangEnd,
                'opening_cash' => $siangOpening,
                'expected_cash' => $siangExpected,
                'closing_cash' => $siangActual,
                'difference' => $siangVar,
                'status' => 'closed',
                'note' => 'Shift siang ramai pembeli offline, setoran kas tunai diserahkan.',
                'created_at' => $siangStart,
                'updated_at' => $siangEnd,
            ]);

            // C. Shift Malam Weekend (22:00 - 04:00)
            if (in_array($currentDate->dayOfWeek, [5, 6])) {
                $malamStart = (clone $currentDate)->addHours(22);
                $malamEnd = (clone $currentDate)->addDays(1)->addHours(4);
                $malamSales = rand(800000, 1800000);
                $malamOpening = 500000;
                $malamExpected = $malamOpening + $malamSales;
                $malamActual = $malamExpected;

                RetailShift::create([
                    'tenant_id' => $tenantId,
                    'user_id' => $cashierModels[2]->id,
                    'opened_at' => $malamStart,
                    'closed_at' => $malamEnd,
                    'opening_cash' => $malamOpening,
                    'expected_cash' => $malamExpected,
                    'closing_cash' => $malamActual,
                    'difference' => 0,
                    'status' => 'closed',
                    'note' => 'Shift malam event promo weekend.',
                    'created_at' => $malamStart,
                    'updated_at' => $malamEnd,
                ]);
            }

            $currentDate->addDay();
        }

        // Today shifts
        $todayPagiStart = Carbon::now()->startOfDay()->addHours(8);
        $todayPagiEnd = Carbon::now()->startOfDay()->addHours(14);
        RetailShift::create([
            'tenant_id' => $tenantId,
            'user_id' => $cashierModels[0]->id,
            'opened_at' => $todayPagiStart,
            'closed_at' => $todayPagiEnd,
            'opening_cash' => 500000,
            'expected_cash' => 2450000,
            'closing_cash' => 2450000,
            'difference' => 0,
            'status' => 'closed',
            'note' => 'Shift pagi hari ini selesai.',
            'created_at' => $todayPagiStart,
            'updated_at' => $todayPagiEnd,
        ]);

        $todaySiangStart = Carbon::now()->startOfDay()->addHours(14);
        RetailShift::create([
            'tenant_id' => $tenantId,
            'user_id' => $cashierModels[1]->id,
            'opened_at' => $todaySiangStart,
            'opening_cash' => 500000,
            'status' => 'open',
            'note' => 'Shift siang aktif berjalan.',
            'created_at' => $todaySiangStart,
            'updated_at' => $todaySiangStart,
        ]);
    }
}
