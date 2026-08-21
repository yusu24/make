<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\BusinessCategory;
use App\Models\User;
use App\Models\KulinerCategory;
use App\Models\KulinerProduct;
use App\Models\KulinerSupplier;
use App\Models\KulinerIngredient;
use App\Models\KulinerRecipeItem;
use App\Models\KulinerIngredientStockMovement;
use App\Models\KulinerIngredientOpname;
use App\Models\KulinerIngredientOpnameItem;
use App\Models\KulinerWaste;
use App\Models\KulinerShift;
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
        $tenantId = env('SEED_TENANT_ID', 'TN-KULINER');

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

        // 2. Ingredients (Bahan Baku) — covers every product's recipe below
        $ingredientDefs = [
            ['code' => 'B-BRS01', 'name' => 'Beras Putih Premium', 'category' => 'Bahan Utama', 'unit' => 'kg', 'min_stock' => 10, 'stock' => 50, 'last_price' => 14000, 'supplier_id' => $supplier->id],
            ['code' => 'B-AYM01', 'name' => 'Daging Ayam Fillet', 'category' => 'Daging', 'unit' => 'kg', 'min_stock' => 5, 'stock' => 20, 'last_price' => 38000, 'supplier_id' => $supplier2->id],
            ['code' => 'B-TLR01', 'name' => 'Telur Ayam Horn', 'category' => 'Bahan Utama', 'unit' => 'kg', 'min_stock' => 5, 'stock' => 15, 'last_price' => 26000, 'supplier_id' => $supplier->id],
            ['code' => 'B-MDK01', 'name' => 'Minyak Goreng', 'category' => 'Bumbu & Cairan', 'unit' => 'liter', 'min_stock' => 10, 'stock' => 30, 'last_price' => 15000, 'supplier_id' => $supplier->id],
            ['code' => 'B-MIE01', 'name' => 'Mie Telur Basah', 'category' => 'Bahan Utama', 'unit' => 'kg', 'min_stock' => 5, 'stock' => 15, 'last_price' => 12000, 'supplier_id' => $supplier2->id],
            ['code' => 'B-KEC01', 'name' => 'Kecap Manis', 'category' => 'Bumbu & Cairan', 'unit' => 'liter', 'min_stock' => 5, 'stock' => 10, 'last_price' => 25000, 'supplier_id' => $supplier->id],
            ['code' => 'B-BST01', 'name' => 'Bumbu Rempah Soto', 'category' => 'Bumbu & Cairan', 'unit' => 'kg', 'min_stock' => 3, 'stock' => 8, 'last_price' => 30000, 'supplier_id' => $supplier2->id],
            ['code' => 'B-PIS01', 'name' => 'Pisang Kepok', 'category' => 'Bahan Utama', 'unit' => 'kg', 'min_stock' => 5, 'stock' => 12, 'last_price' => 10000, 'supplier_id' => $supplier2->id],
            ['code' => 'B-KJU01', 'name' => 'Keju Cheddar Parut', 'category' => 'Bumbu & Cairan', 'unit' => 'kg', 'min_stock' => 2, 'stock' => 5, 'last_price' => 90000, 'supplier_id' => $supplier->id],
            ['code' => 'B-TEH01', 'name' => 'Teh Celup Melati', 'category' => 'Minuman', 'unit' => 'kg', 'min_stock' => 1, 'stock' => 3, 'last_price' => 45000, 'supplier_id' => $supplier->id],
            ['code' => 'B-SRP01', 'name' => 'Sirup Gula', 'category' => 'Minuman', 'unit' => 'liter', 'min_stock' => 3, 'stock' => 8, 'last_price' => 18000, 'supplier_id' => $supplier->id],
            ['code' => 'B-GLA01', 'name' => 'Gula Aren Cair', 'category' => 'Minuman', 'unit' => 'liter', 'min_stock' => 3, 'stock' => 6, 'last_price' => 28000, 'supplier_id' => $supplier2->id],
            ['code' => 'B-SUS01', 'name' => 'Susu Cair', 'category' => 'Minuman', 'unit' => 'liter', 'min_stock' => 5, 'stock' => 10, 'last_price' => 20000, 'supplier_id' => $supplier->id],
            ['code' => 'B-KPI01', 'name' => 'Kopi Bubuk Espresso', 'category' => 'Minuman', 'unit' => 'kg', 'min_stock' => 2, 'stock' => 4, 'last_price' => 120000, 'supplier_id' => $supplier2->id],
        ];

        $ingredientModels = [];
        foreach ($ingredientDefs as $ing) {
            $ingredientModels[$ing['name']] = KulinerIngredient::firstOrCreate(
                ['tenant_id' => $tenantId, 'code' => $ing['code']],
                $ing
            );
        }

        // 3. Roles
        $roleDefs = [
            ['name' => 'Manajer Operasional', 'permissions' => ['all']],
            ['name' => 'Kasir Utama', 'permissions' => ['pos_access', 'reports_view']],
            ['name' => 'Kepala Dapur', 'permissions' => ['kitchen_display', 'inventory_manage']],
            ['name' => 'Pelayan', 'permissions' => ['pos_access']]
        ];

        $roleModels = [];
        foreach ($roleDefs as $role) {
            $roleModels[$role['name']] = KulinerRole::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => $role['name']],
                ['permissions' => $role['permissions']]
            );
        }

        // 3.5 Staff — real User accounts (Kuliner "Staff" page lists users with
        // role in [cashier, chef, staff], see KulinerController::getStaff()).
        $category = BusinessCategory::where('slug', 'kuliner')->first();
        $staffDefs = [
            ['name' => 'Rina Manajer', 'email' => 'rina.manajer@demo-resto.com', 'role' => 'staff', 'kuliner_role' => 'Manajer Operasional'],
            ['name' => 'Budi Kasir', 'email' => 'budi.kasir@demo-resto.com', 'role' => 'cashier', 'kuliner_role' => 'Kasir Utama'],
            ['name' => 'Siti Koki', 'email' => 'siti.koki@demo-resto.com', 'role' => 'chef', 'kuliner_role' => 'Kepala Dapur'],
            ['name' => 'Dedi Pelayan', 'email' => 'dedi.pelayan@demo-resto.com', 'role' => 'staff', 'kuliner_role' => 'Pelayan'],
        ];
        $staffModels = [];
        foreach ($staffDefs as $s) {
            $staffModels[$s['name']] = User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('password'),
                    'role' => $s['role'],
                    'status' => 'active',
                    'business_category_id' => $category?->id,
                    'tenant_id' => $tenantId,
                    'kuliner_role_id' => $roleModels[$s['kuliner_role']]->id,
                ]
            );
        }
        $cashier = $staffModels['Budi Kasir'];

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

        // 6. Testimonials (feeds the "Ulasan" / CulinaryReviews page)
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

        $products = KulinerProduct::where('tenant_id', $tenantId)->get()->keyBy('name');

        $nasiGoreng = $products->get('Nasi Goreng Spesial');
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

        $esTeh = $products->get('Es Teh Manis Jumbo');
        if ($nasiGoreng && $esTeh) {
            KulinerBundleItem::firstOrCreate(['bundle_id' => $bundle->id, 'product_id' => $nasiGoreng->id], ['quantity' => 1]);
            KulinerBundleItem::firstOrCreate(['bundle_id' => $bundle->id, 'product_id' => $esTeh->id], ['quantity' => 1]);
        }

        // 9. Recipes / BOM — links each menu item to the ingredients it consumes
        $recipeDefs = [
            'Nasi Goreng Spesial' => [
                ['Beras Putih Premium', 0.25], ['Telur Ayam Horn', 0.1], ['Daging Ayam Fillet', 0.05],
                ['Minyak Goreng', 0.03], ['Kecap Manis', 0.02],
            ],
            'Mie Goreng Jawa' => [
                ['Mie Telur Basah', 0.2], ['Telur Ayam Horn', 0.1], ['Daging Ayam Fillet', 0.05],
                ['Minyak Goreng', 0.03], ['Kecap Manis', 0.02],
            ],
            'Ayam Bakar Madu' => [
                ['Daging Ayam Fillet', 0.3], ['Kecap Manis', 0.03],
            ],
            'Soto Ayam Lamongan' => [
                ['Daging Ayam Fillet', 0.15], ['Bumbu Rempah Soto', 0.05], ['Beras Putih Premium', 0.1],
            ],
            'Pisang Goreng Keju' => [
                ['Pisang Kepok', 0.2], ['Minyak Goreng', 0.05], ['Keju Cheddar Parut', 0.03],
            ],
            'Es Teh Manis Jumbo' => [
                ['Teh Celup Melati', 0.01], ['Sirup Gula', 0.03],
            ],
            'Kopi Susu Gula Aren' => [
                ['Kopi Bubuk Espresso', 0.02], ['Susu Cair', 0.15], ['Gula Aren Cair', 0.03],
            ],
        ];
        foreach ($recipeDefs as $productName => $items) {
            $product = $products->get($productName);
            if (!$product) {
                continue;
            }
            foreach ($items as [$ingName, $qty]) {
                KulinerRecipeItem::updateOrCreate(
                    ['tenant_id' => $tenantId, 'product_id' => $product->id, 'ingredient_id' => $ingredientModels[$ingName]->id],
                    ['quantity' => $qty]
                );
            }
        }

        // 10. A week of expenses (non-ingredient operational costs)
        $expenseDefs = [
            ['category' => 'Sewa Tempat', 'description' => 'Sewa kios bulanan (prorata mingguan)', 'amount' => 700000, 'days_ago' => 6],
            ['category' => 'Operasional', 'description' => 'Listrik dan air minggu ini', 'amount' => 150000, 'days_ago' => 5],
            ['category' => 'Belanja Bahan', 'description' => 'Beli beras dan ayam di pasar', 'amount' => 350000, 'days_ago' => 4],
            ['category' => 'Gaji Karyawan', 'description' => 'Gaji harian staf paruh waktu', 'amount' => 400000, 'days_ago' => 3],
            ['category' => 'Belanja Bahan', 'description' => 'Restock sayur dan bumbu dapur', 'amount' => 280000, 'days_ago' => 2],
            ['category' => 'Lain-lain', 'description' => 'Perbaikan kran air rusak', 'amount' => 75000, 'days_ago' => 1],
            ['category' => 'Operasional', 'description' => 'Beli galon air minum & gas LPG', 'amount' => 120000, 'days_ago' => 0],
        ];
        foreach ($expenseDefs as $exp) {
            $date = Carbon::now()->subDays($exp['days_ago'])->format('Y-m-d');
            KulinerExpense::firstOrCreate(
                ['tenant_id' => $tenantId, 'description' => $exp['description'], 'date' => $date],
                ['category' => $exp['category'], 'amount' => $exp['amount'], 'date' => $date]
            );
        }

        // 11. Orders — exactly the last 7 days (6 days ago through today), so
        // reports/finance/sales show one clean week. Today gets a spread of
        // active statuses (pending/processing/ready) so Kitchen Queue has
        // something in every column; past days are settled (completed, with
        // one cancelled order for realism). Everything below is derived from
        // $daysAgo/$i/$j (no rand()) so re-running this seeder regenerates
        // the exact same order_number/items every time instead of piling up
        // new rows each run.
        if ($products->count() > 0) {
            $productList = $products->values();
            $productCount = $productList->count();
            $ordersPerDay = [6 => 5, 5 => 6, 4 => 5, 3 => 6, 2 => 5, 1 => 6, 0 => 7];
            $statusCycle = ['completed', 'completed', 'completed', 'completed', 'processing'];
            $paymentCycle = ['cash_cashier', 'cash_cashier', 'qris'];
            $orderTypeCycle = ['dine_in', 'takeaway', 'dine_in'];

            for ($daysAgo = 6; $daysAgo >= 0; $daysAgo--) {
                $isToday = $daysAgo === 0;
                $ordersToday = $ordersPerDay[$daysAgo];
                $dateKey = Carbon::now()->subDays($daysAgo)->format('Ymd');

                for ($i = 0; $i < $ordersToday; $i++) {
                    $slot = $daysAgo * 10 + $i; // stable per-slot seed for the deterministic picks below

                    if ($isToday && $i < 3) {
                        // Guarantee at least one order sitting in each Kitchen
                        // Queue column today.
                        $status = ['pending', 'processing', 'ready'][$i];
                    } else {
                        $status = ($daysAgo === 3 && $i === 0) ? 'cancelled' : $statusCycle[$slot % count($statusCycle)];
                    }

                    $payment = $paymentCycle[$slot % count($paymentCycle)];
                    $orderType = $orderTypeCycle[$slot % count($orderTypeCycle)];
                    $createdAt = Carbon::now()->subDays($daysAgo)->setTime(10 + ($slot % 10), ($slot * 7) % 60);

                    $order = Order::updateOrCreate(
                        [
                            'tenant_id' => $tenantId,
                            'order_number' => 'ORD-' . $dateKey . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                        ],
                        [
                            'customer_name' => 'Tamu ' . ($slot + 1),
                            'total' => 0,
                            'status' => $status,
                            'payment_method' => $payment,
                            'order_type' => $orderType,
                            'table_number' => $orderType === 'dine_in' ? 'Meja ' . (($slot % 10) + 1) : null,
                            'cashier_id' => $cashier->id,
                            'created_at' => $createdAt,
                            'updated_at' => $createdAt,
                        ]
                    );

                    // 1-2 distinct items per order, picked deterministically;
                    // skip a $j slot if it would repeat a product already on
                    // this order rather than creating a second row for it.
                    $itemsCount = ($slot % 2) + 1;
                    $usedProductIds = [];
                    for ($j = 0; $j < $itemsCount; $j++) {
                        $prod = $productList[($slot + $j * 3) % $productCount];
                        if (in_array($prod->id, $usedProductIds, true)) {
                            continue;
                        }
                        $usedProductIds[] = $prod->id;
                        $qty = (($slot + $j) % 2) + 1;

                        OrderItem::updateOrCreate(
                            ['order_id' => $order->id, 'product_id' => $prod->id],
                            [
                                'name' => $prod->name,
                                'price' => $prod->price,
                                'qty' => $qty,
                                'subtotal' => $prod->price * $qty,
                            ]
                        );
                    }

                    // Recompute from whatever items actually persisted for
                    // this order, rather than a running total, so re-runs
                    // can't drift the two out of sync.
                    $order->update(['total' => OrderItem::where('order_id', $order->id)->sum('subtotal')]);
                }
            }
        }

        // 12. Shifts — one closed shift per past day, plus today's shift left
        // open (so the Shift page has both historical and an in-progress
        // example).
        for ($daysAgo = 6; $daysAgo >= 1; $daysAgo--) {
            $opened = Carbon::now()->subDays($daysAgo)->setTime(9, 0);
            $closed = Carbon::now()->subDays($daysAgo)->setTime(21, 0);
            $opening = 500000;
            $expected = $opening + rand(800000, 2500000);
            $counted = $expected - rand(-20000, 20000);

            KulinerShift::updateOrCreate(
                ['tenant_id' => $tenantId, 'user_id' => $cashier->id, 'opened_at' => $opened],
                [
                    'opening_cash' => $opening,
                    'closing_cash' => $counted,
                    'expected_cash' => $expected,
                    'difference' => $counted - $expected,
                    'status' => 'closed',
                    'note' => 'Shift harian toko',
                    'closed_at' => $closed,
                ]
            );
        }
        KulinerShift::updateOrCreate(
            ['tenant_id' => $tenantId, 'user_id' => $cashier->id, 'status' => 'open'],
            [
                'opening_cash' => 500000,
                'closing_cash' => null,
                'expected_cash' => null,
                'difference' => null,
                'note' => 'Shift hari ini',
                'opened_at' => Carbon::now()->setTime(9, 0),
                'closed_at' => null,
            ]
        );

        // 13. Waste — a few ingredient losses spread across the week
        $wasteDefs = [
            ['ingredient' => 'Daging Ayam Fillet', 'qty' => 0.8, 'reason' => 'expired', 'note' => 'Kadaluarsa sebelum sempat dipakai', 'days_ago' => 5],
            ['ingredient' => 'Pisang Kepok', 'qty' => 1.2, 'reason' => 'damaged', 'note' => 'Terlalu matang / busuk', 'days_ago' => 3],
            ['ingredient' => 'Telur Ayam Horn', 'qty' => 0.3, 'reason' => 'damaged', 'note' => 'Pecah saat penyimpanan', 'days_ago' => 1],
        ];
        foreach ($wasteDefs as $w) {
            $ingredient = $ingredientModels[$w['ingredient']];
            $date = Carbon::now()->subDays($w['days_ago'])->toDateString();
            KulinerWaste::updateOrCreate(
                ['tenant_id' => $tenantId, 'ingredient_id' => $ingredient->id, 'waste_date' => $date],
                [
                    'quantity' => $w['qty'],
                    'reason' => $w['reason'],
                    'note' => $w['note'],
                    'value_lost' => round($w['qty'] * (float) $ingredient->last_price),
                    'user_id' => $cashier->id,
                ]
            );
        }

        // 14. Ingredient stock movements — a supplier delivery earlier in the
        // week for realism/history (current `stock` values above already
        // reflect the "now" snapshot, same approach as the retail seeder).
        $movementDefs = [
            ['ingredient' => 'Beras Putih Premium', 'qty' => 25, 'days_ago' => 6, 'note' => 'Penerimaan dari PT Pangan Segar'],
            ['ingredient' => 'Daging Ayam Fillet', 'qty' => 10, 'days_ago' => 6, 'note' => 'Penerimaan dari CV Makmur Jaya'],
            ['ingredient' => 'Minyak Goreng', 'qty' => 15, 'days_ago' => 4, 'note' => 'Restok minyak goreng'],
        ];
        foreach ($movementDefs as $m) {
            $ingredient = $ingredientModels[$m['ingredient']];
            $date = Carbon::now()->subDays($m['days_ago']);
            KulinerIngredientStockMovement::firstOrCreate(
                ['tenant_id' => $tenantId, 'ingredient_id' => $ingredient->id, 'note' => $m['note']],
                [
                    'type' => 'in',
                    'quantity' => $m['qty'],
                    'quantity_before' => (float) $ingredient->stock - $m['qty'],
                    'quantity_after' => (float) $ingredient->stock,
                    'user_id' => $cashier->id,
                    'created_at' => $date,
                ]
            );
        }

        // 15. Ingredient stock opname — one finalized session with a couple
        // of minor discrepancies.
        $opname = KulinerIngredientOpname::updateOrCreate(
            ['tenant_id' => $tenantId, 'note' => 'Opname mingguan dapur'],
            ['status' => 'approved', 'user_id' => $cashier->id, 'approved_by' => $cashier->id, 'approved_at' => Carbon::now()->subDay()]
        );
        $opnameItemDefs = [
            ['ingredient' => 'Beras Putih Premium', 'diff' => -1],
            ['ingredient' => 'Telur Ayam Horn', 'diff' => 0],
            ['ingredient' => 'Minyak Goreng', 'diff' => -0.5],
        ];
        foreach ($opnameItemDefs as $it) {
            $ingredient = $ingredientModels[$it['ingredient']];
            $system = (float) $ingredient->stock;
            $physical = $system + $it['diff'];
            KulinerIngredientOpnameItem::updateOrCreate(
                ['opname_id' => $opname->id, 'ingredient_id' => $ingredient->id],
                ['system_qty' => $system, 'physical_qty' => $physical, 'difference' => $it['diff']]
            );
        }

        // 16. Settings (Hero Image)
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
