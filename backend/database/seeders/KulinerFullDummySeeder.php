<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\KulinerCategory;
use App\Models\KulinerProduct;
use App\Models\KulinerSupplier;
use App\Models\KulinerIngredient;
use App\Models\KulinerRole;
use App\Models\KulinerTable;
use App\Models\KulinerPromo;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\KulinerExpense;
use App\Models\KulinerTestimonial;
use App\Models\KulinerModifierGroup;
use App\Models\KulinerModifierOption;
use App\Models\KulinerAddon;
use App\Models\KulinerBundle;
use App\Models\KulinerBundleItem;
use Carbon\Carbon;

class KulinerFullDummySeeder extends Seeder
{
    public function run()
    {
        $tenantId = 'TN-KULINER';

        $this->command->info('Menjalankan KulinerFullDummySeeder untuk tenant: ' . $tenantId);

        // 1. Supplier
        $supplier = KulinerSupplier::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'PT Pangan Segar'],
            ['contact' => 'Budi - 081234567890', 'address' => 'Jl. Pasar Induk No. 10']
        );
        $supplier2 = KulinerSupplier::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'CV Makmur Jaya'],
            ['contact' => 'Ani - 081298765432', 'address' => 'Jl. Sayuran No. 5']
        );

        // 2. Ingredients (Bahan Baku)
        $ingredients = [
            ['code' => 'B-BRS01', 'name' => 'Beras Putih Premium', 'category' => 'Bahan Utama', 'unit' => 'kg', 'min_stock' => 10, 'stock' => 50, 'last_price' => 14000, 'supplier_id' => $supplier->id],
            ['code' => 'B-AYM01', 'name' => 'Daging Ayam Fillet', 'category' => 'Daging', 'unit' => 'kg', 'min_stock' => 5, 'stock' => 20, 'last_price' => 38000, 'supplier_id' => $supplier2->id],
            ['code' => 'B-TLR01', 'name' => 'Telur Ayam Horn', 'category' => 'Bahan Utama', 'unit' => 'kg', 'min_stock' => 5, 'stock' => 15, 'last_price' => 26000, 'supplier_id' => $supplier->id],
            ['code' => 'B-MDK01', 'name' => 'Minyak Goreng', 'category' => 'Bumbu & Cairan', 'unit' => 'liter', 'min_stock' => 10, 'stock' => 30, 'last_price' => 15000, 'supplier_id' => $supplier->id],
        ];

        foreach ($ingredients as $ing) {
            KulinerIngredient::firstOrCreate(
                ['tenant_id' => $tenantId, 'code' => $ing['code']],
                $ing
            );
        }

        // 3. Roles
        $roles = [
            ['name' => 'Manajer Operasional', 'permissions' => ['all']],
            ['name' => 'Kasir Utama', 'permissions' => ['pos_access', 'reports_view']],
            ['name' => 'Kepala Dapur', 'permissions' => ['kitchen_display', 'inventory_manage']],
            ['name' => 'Pelayan', 'permissions' => ['pos_access']]
        ];

        foreach ($roles as $role) {
            KulinerRole::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => $role['name']],
                ['permissions' => $role['permissions']]
            );
        }

        // 4. Tables
        $tables = [
            ['name' => 'Meja 01', 'capacity' => 4, 'status' => 'empty'],
            ['name' => 'Meja 02', 'capacity' => 4, 'status' => 'occupied'],
            ['name' => 'Meja 03', 'capacity' => 2, 'status' => 'empty'],
            ['name' => 'Meja VIP 1', 'capacity' => 8, 'status' => 'empty'],
        ];
        foreach ($tables as $tbl) {
            KulinerTable::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => $tbl['name']],
                $tbl
            );
        }

        // 5. Promos
        $promos = [
            ['name' => 'Promo Merdeka', 'code' => 'MERDEKA2026', 'type' => 'discount', 'value' => 17, 'status' => 'active', 'expired_at' => Carbon::now()->addDays(20)],
            ['name' => 'Diskon Pelajar', 'code' => 'PELAJAR', 'type' => 'nominal', 'value' => 5000, 'status' => 'active', 'expired_at' => Carbon::now()->addMonths(6)],
        ];
        foreach ($promos as $promo) {
            KulinerPromo::firstOrCreate(
                ['tenant_id' => $tenantId, 'code' => $promo['code']],
                $promo
            );
        }

        // 6. Testimonials
        $testimonials = [
            ['customer_name' => 'Sinta Ayu', 'rating' => 5, 'comment' => 'Nasi gorengnya luar biasa enak! Bumbunya pas dan porsinya banyak.', 'is_displayed' => true],
            ['customer_name' => 'Andi Susanto', 'rating' => 4, 'comment' => 'Tempat nyaman dan pelayanan cepat. Soto Ayamnya recommended.', 'is_displayed' => true],
            ['customer_name' => 'Reza Pahlevi', 'rating' => 5, 'comment' => 'Harga terjangkau tapi rasanya bintang lima. Sering ada promo juga!', 'is_displayed' => true],
        ];
        foreach ($testimonials as $testi) {
            KulinerTestimonial::firstOrCreate(
                ['tenant_id' => $tenantId, 'customer_name' => $testi['customer_name']],
                $testi
            );
        }

        // 7. Modifiers & Addons
        $modGroup = KulinerModifierGroup::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Tingkat Kepedasan'],
            ['is_required' => true]
        );
        $modOptions = [
            ['name' => 'Tidak Pedas', 'price_delta' => 0],
            ['name' => 'Sedang', 'price_delta' => 0],
            ['name' => 'Sangat Pedas', 'price_delta' => 0],
        ];
        foreach ($modOptions as $opt) {
            KulinerModifierOption::firstOrCreate(
                ['modifier_group_id' => $modGroup->id, 'name' => $opt['name']],
                $opt
            );
        }

        $addon1 = KulinerAddon::firstOrCreate(['tenant_id' => $tenantId, 'name' => 'Telur Mata Sapi'], ['price' => 4000, 'is_active' => true]);
        $addon2 = KulinerAddon::firstOrCreate(['tenant_id' => $tenantId, 'name' => 'Kerupuk Udang'], ['price' => 2500, 'is_active' => true]);

        // Attach Modifier & Addons to Nasi Goreng Spesial if exists
        $nasiGoreng = KulinerProduct::where('tenant_id', $tenantId)->where('name', 'Nasi Goreng Spesial')->first();
        if ($nasiGoreng) {
            $modGroup->products()->syncWithoutDetaching([$nasiGoreng->id]);
            $addon1->products()->syncWithoutDetaching([$nasiGoreng->id]);
            $addon2->products()->syncWithoutDetaching([$nasiGoreng->id]);
        }

        // 8. Bundle
        $bundle = KulinerBundle::firstOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Paket Kenyang Hemat'],
            ['description' => 'Nasi Goreng + Es Teh Manis', 'bundle_price' => 25000, 'is_active' => true]
        );
        
        $esTeh = KulinerProduct::where('tenant_id', $tenantId)->where('name', 'Es Teh Manis Jumbo')->first();
        if ($nasiGoreng && $esTeh) {
            KulinerBundleItem::firstOrCreate(['bundle_id' => $bundle->id, 'product_id' => $nasiGoreng->id], ['quantity' => 1]);
            KulinerBundleItem::firstOrCreate(['bundle_id' => $bundle->id, 'product_id' => $esTeh->id], ['quantity' => 1]);
        }

        // 9. Expenses (Finance)
        $expenses = [
            ['category' => 'Belanja Bahan', 'description' => 'Beli beras dan ayam di pasar', 'amount' => 350000, 'date' => Carbon::now()->subDays(1)->format('Y-m-d')],
            ['category' => 'Operasional', 'description' => 'Listrik dan Air', 'amount' => 150000, 'date' => Carbon::now()->subDays(3)->format('Y-m-d')],
            ['category' => 'Lain-lain', 'description' => 'Perbaikan kran air rusak', 'amount' => 75000, 'date' => Carbon::now()->format('Y-m-d')],
        ];
        foreach ($expenses as $exp) {
            KulinerExpense::firstOrCreate(
                ['tenant_id' => $tenantId, 'description' => $exp['description'], 'date' => $exp['date']],
                $exp
            );
        }

        // 10. Orders & Transactions
        // We will create some historical orders
        $products = KulinerProduct::where('tenant_id', $tenantId)->get();
        if ($products->count() > 0) {
            for ($i = 0; $i < 15; $i++) {
                $status = ['completed', 'completed', 'completed', 'processing', 'pending'][rand(0, 4)];
                $payment = ['cash_cashier', 'cash_cashier', 'qris'][rand(0, 2)];
                $orderType = ['dine_in', 'takeaway', 'dine_in'][rand(0, 2)];
                
                $order = Order::firstOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'order_number' => 'ORD-' . Carbon::now()->subDays(rand(0, 10))->format('Ymd') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    ],
                    [
                        'customer_name' => 'Tamu ' . ($i + 1),
                        'total' => 0,
                        'status' => $status,
                        'payment_method' => $payment,
                        'order_type' => $orderType,
                        'table_number' => $orderType === 'dine_in' ? 'Meja ' . rand(1, 10) : null,
                        'created_at' => Carbon::now()->subDays(rand(0, 7))->subHours(rand(1, 10)),
                        'updated_at' => Carbon::now(),
                    ]
                );

                $total = 0;
                $itemsCount = rand(1, 3);
                for ($j = 0; $j < $itemsCount; $j++) {
                    $prod = $products->random();
                    $qty = rand(1, 2);
                    $subtotal = $prod->price * $qty;
                    $total += $subtotal;
                    
                    OrderItem::firstOrCreate(
                        ['order_id' => $order->id, 'product_id' => $prod->id],
                        [
                            'name' => $prod->name,
                            'price' => $prod->price,
                            'qty' => $qty,
                            'subtotal' => $subtotal,
                        ]
                    );
                }
                
                $order->update(['total' => $total]);
            }
        }

        // 11. Settings (Hero Image)
        \App\Models\KulinerSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'store_name' => 'Demo Resto Nusantara',
                'hero_title' => 'Cita Rasa Nusantara Autentik',
                'hero_subtitle' => 'Masakan rumahan berkualitas restoran',
                'hero_image_url' => 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1920',
            ]
        );

        $this->command->info('Data dummy Kuliner (Tenant: ' . $tenantId . ') berhasil di-seed.');
    }
}
