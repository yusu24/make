<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\RetailCategory;
use App\Models\RetailUnit;
use App\Models\RetailProduct;
use App\Models\RetailSupplier;
use App\Models\RetailCustomer;
use App\Models\RetailPurchase;
use App\Models\RetailPurchaseItem;
use App\Models\RetailTransaction;
use App\Models\RetailProductBatch;
use App\Models\RetailTransactionItem;
use App\Models\RetailFinanceCategory;
use App\Models\RetailIncome;
use App\Models\RetailExpense;
use App\Models\RetailOutlet;
use App\Models\RetailShift;
use App\Models\RetailCashTransfer;
use App\Models\RetailPayable;
use App\Models\RetailReceivable;
use App\Models\RetailCustomerReturn;
use App\Models\RetailCustomerReturnItem;
use App\Models\RetailSupplierReturn;
use App\Models\RetailSupplierReturnItem;
use App\Models\RetailStockOpname;
use App\Models\RetailStockOpnameItem;
use App\Models\RetailStockTransfer;
use App\Models\RetailStockTransferItem;
use App\Models\RetailDiscount;
use App\Models\RetailPricelist;
use App\Models\RetailPricelistItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RetailFullDummySeeder extends Seeder
{
    public function run()
    {
        // Find all retail demo tenants
        $tenants = Tenant::whereHas('businessCategory', function($q) {
            $q->where('name', 'Toko Retail');
        })->get();

        if ($tenants->isEmpty()) {
            echo "No retail tenant found.\n";
            return;
        }

        foreach ($tenants as $tenant) {
            $this->runForTenant($tenant->tenant_id, $tenant->name);
        }
    }

    public function runForTenant($tenantId, $tenantName = 'Demo Tenant')
    {
        $tenant = Tenant::where('tenant_id', $tenantId)->first();
        if (!$tenant) return;

        DB::beginTransaction();
        try {
            $faker = class_exists('\Faker\Factory') ? \Faker\Factory::create('id_ID') : null;
            $fakerName = fn() => $faker ? $faker->name : ('Pelanggan Demo ' . rand(100, 999));
            $fakerPhone = fn() => $faker ? $faker->phoneNumber : ('0812' . rand(10000000, 99999999));
            $fakerCompany = fn() => $faker ? $faker->company : ('PT Supplier Demo ' . rand(10, 99));
            $fakerAddress = fn() => $faker ? $faker->address : 'Jl. Raya Industri No. ' . rand(1, 100);
            $fakerElem = fn($arr) => $faker ? $faker->randomElement($arr) : $arr[array_rand($arr)];

            // echo "Seeding Full Dummy Data (1 Bulan) for Tenant: {$tenantName} ({$tenantId})\n";

            $outlet = RetailOutlet::firstOrCreate([
                'tenant_id' => $tenant->id,
                'name' => 'Cabang Pusat',
                'phone' => '08123456789'
            ]);

            // Ensure units exist
            $units = ['Pcs', 'Box', 'Pack', 'Botol', 'Gram', 'Kg'];
            foreach ($units as $u) {
                RetailUnit::updateOrCreate(['tenant_id' => $tenantId, 'name' => $u]);
            }
            
            // Customers
            for ($i=0; $i<15; $i++) {
                RetailCustomer::firstOrCreate([
                    'tenant_id' => $tenantId,
                    'name' => $fakerName(),
                    'contact' => $fakerPhone(),
                    'tier' => $fakerElem(['regular', 'member'])
                ]);
            }
            
            // Suppliers
            for ($i=0; $i<8; $i++) {
                RetailSupplier::firstOrCreate([
                    'tenant_id' => $tenantId,
                    'name' => $fakerCompany(),
                    'contact' => $fakerPhone(),
                    'address' => $fakerAddress()
                ]);
            }

            $customers = RetailCustomer::where('tenant_id', $tenantId)->pluck('id')->toArray();
            $suppliers = RetailSupplier::where('tenant_id', $tenantId)->pluck('id')->toArray();
            $products = RetailProduct::where('tenant_id', $tenantId)->get();

            if ($products->count() === 0) {
                echo "No products found. Run RetailTestingSeeder first.\n";
                return;
            }

            // Diskon & Promo
            RetailDiscount::firstOrCreate(
                ['tenant_id' => $tenantId, 'code' => 'PROMO10'],
                [
                    'name' => 'Diskon 10% Spesial',
                    'type' => 'percentage',
                    'value' => 10,
                    'min_purchase' => 50000,
                    'is_active' => true,
                    'starts_at' => Carbon::now()->subMonths(2)->format('Y-m-d H:i:s'),
                    'expires_at' => Carbon::now()->addMonths(2)->format('Y-m-d H:i:s'),
                ]
            );
            
            // Pricelist Member
            $pricelist = RetailPricelist::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => 'Harga Member VIP'],
                ['type' => 'member']
            );
            if ($pricelist->wasRecentlyCreated) {
                foreach ($products->take(5) as $prod) {
                    RetailPricelistItem::create([
                        'pricelist_id' => $pricelist->id,
                        'product_id' => $prod->id,
                        'price' => $prod->price_sell * 0.9 // 10% off
                    ]);
                }
            }

            // Finance Categories
            RetailFinanceCategory::firstOrCreate(['tenant_id' => $tenantId, 'name' => 'Listrik & Air', 'type' => 'expense']);
            RetailFinanceCategory::firstOrCreate(['tenant_id' => $tenantId, 'name' => 'Gaji Karyawan', 'type' => 'expense']);
            RetailFinanceCategory::firstOrCreate(['tenant_id' => $tenantId, 'name' => 'Lain-lain', 'type' => 'income']);

            $expenseCats = RetailFinanceCategory::where('tenant_id', $tenantId)->where('type', 'expense')->pluck('id')->toArray();
            $incomeCats = RetailFinanceCategory::where('tenant_id', $tenantId)->where('type', 'income')->pluck('id')->toArray();

            $user = \App\Models\User::where('tenant_id', $tenantId)->first();
            $userId = $user ? $user->id : 1;

            // Ensure tax rate is > 0 for demo purposes
            $setting = \App\Models\RetailSetting::firstOrCreate(['tenant_id' => $tenantId]);
            if (!$setting->tax_rate || $setting->tax_rate <= 0) {
                $setting->update(['tax_rate' => 11]);
            }
            $taxRate = $setting->tax_rate / 100;

            // Generate 1 month of data
            $startDate = Carbon::now()->subMonth(1);
            $endDate = Carbon::now();
            $currentDate = clone $startDate;

            // echo "Generating daily transactions...\n";

            while ($currentDate <= $endDate) {
                $shiftTimeStart = (clone $currentDate)->startOfDay()->addHours(8); // Shift Pagi (08:00)
                $shiftTimeEnd = (clone $currentDate)->startOfDay()->addHours(20); // Tutup Shift (20:00)

                // 1. SHIFT KASIR
                $shift = RetailShift::create([
                    'tenant_id' => $tenantId,
                    'user_id' => $userId, // Dummy
                    'opened_at' => $shiftTimeStart,
                    'closed_at' => $shiftTimeEnd,
                    'opening_cash' => 500000,
                    'closing_cash' => 500000 + rand(1000000, 3000000), // Dummy
                    'expected_cash' => 500000 + rand(1000000, 3000000),
                    'status' => 'closed',
                    'note' => 'Tutup shift harian',
                    'created_at' => $shiftTimeStart,
                    'updated_at' => $shiftTimeEnd
                ]);

                // 2. Transactions (Penjualan)
                $dailyTransactions = rand(5, 15);
                for ($i=0; $i<$dailyTransactions; $i++) {
                    $time = (clone $currentDate)->startOfDay()->addHours(rand(8, 19))->addMinutes(rand(0, 59));
                    
                    // Simulate Piutang
                    $paymentMethod = $fakerElem(['CASH', 'QRIS', 'TRANSFER', 'PIUTANG']);
                    $status = ($paymentMethod == 'PIUTANG') ? 'unpaid' : 'paid';

                    $customerId = (rand(1, 100) > 40 || $paymentMethod == 'PIUTANG') ? $fakerElem($customers) : null;

                    $trx = RetailTransaction::create([
                        'tenant_id' => $tenantId,
                        'customer_id' => $customerId,
                        'user_id' => $userId, 
                        'invoice_no' => 'INV-' . $time->format('Ymd') . '-' . rand(1000, 9999),
                        'total_amount' => 0,
                        'tax_amount' => 0,
                        'payment_method' => $paymentMethod,
                        'status' => $status,
                        'created_at' => $time,
                        'updated_at' => $time
                    ]);

                    $itemsCount = rand(1, 5);
                    $totalAmount = 0;
                    
                    for ($j=0; $j<$itemsCount; $j++) {
                        $prod = $products->random();
                        $qty = rand(1, 4);
                        $subtotal = $prod->price_sell * $qty;
                        $totalAmount += $subtotal;

                        RetailTransactionItem::create([
                            'transaction_id' => $trx->id,
                            'product_id' => $prod->id,
                            'qty' => $qty,
                            'price' => $prod->price_sell,
                            'subtotal' => $subtotal,
                            'created_at' => $time,
                            'updated_at' => $time
                        ]);
                    }

                    $taxAmount = rand(0, 1) ? round($totalAmount * $taxRate) : 0; // 50% chance to have tax
                    $finalTotal = $totalAmount + $taxAmount;

                    $trx->update([
                        'total_amount' => $finalTotal,
                        'tax_amount' => $taxAmount
                    ]);

                    // Payment
                    if ($status == 'paid') {
                        \App\Models\RetailTransactionPayment::create([
                            'transaction_id' => $trx->id,
                            'amount' => $finalTotal,
                            'payment_method' => $paymentMethod,
                            'created_at' => $time,
                            'updated_at' => $time
                        ]);
                    }

                    // Piutang
                    if ($status == 'unpaid') {
                        RetailReceivable::create([
                            'tenant_id' => $tenantId,
                            'transaction_id' => $trx->id,
                            'customer_id' => $trx->customer_id,
                            'total_amount' => $finalTotal,
                            'paid_amount' => rand(0, $finalTotal / 2),
                            'due_date' => $time->copy()->addDays(14)->format('Y-m-d'),
                            'status' => 'unpaid',
                            'created_at' => $time,
                            'updated_at' => $time
                        ]);
                    }
                }

                // 3. Purchase Orders (Stok Masuk) & Hutang
                if (rand(1, 100) > 80) { // 20% chance per day
                    $poTime = clone $currentDate;
                    $poTime->addHours(9);
                    $paymentStatus = $fakerElem(['paid', 'unpaid', 'partial']);

                    $po = RetailPurchase::create([
                        'tenant_id' => $tenantId,
                        'supplier_id' => !empty($suppliers) ? $fakerElem($suppliers) : null,
                        'total_cost' => 0,
                        'purchase_date' => $poTime->format('Y-m-d'),
                        'created_at' => $poTime,
                        'updated_at' => $poTime
                    ]);

                    $poItemsCount = rand(3, 8);
                    $poTotal = 0;
                    for ($k=0; $k<$poItemsCount; $k++) {
                        $prod = $products->random();
                        $qty = rand(10, 50);
                        $cost = $prod->price_buy;
                        $subtotal = $cost * $qty;
                        $poTotal += $subtotal;

                        RetailPurchaseItem::create([
                            'purchase_id' => $po->id,
                            'product_id' => $prod->id,
                            'qty' => $qty,
                            'cost_per_item' => $cost,
                            'subtotal' => $subtotal,
                            'created_at' => $poTime,
                            'updated_at' => $poTime
                        ]);
                        
                        RetailProductBatch::create([
                            'tenant_id' => $tenant->id,
                            'product_id' => $prod->id,
                            'outlet_id' => $outlet->id,
                            'batch_no' => 'B-' . $poTime->format('ymd') . '-' . rand(10, 99),
                            'expired_date' => $poTime->copy()->addMonths(rand(3, 24))->format('Y-m-d'),
                            'stock' => $qty,
                            'created_at' => $poTime,
                            'updated_at' => $poTime
                        ]);
                    }
                    $po->update(['total_cost' => $poTotal]);

                    if ($paymentStatus != 'paid') {
                        RetailPayable::create([
                            'tenant_id' => $tenantId,
                            'purchase_id' => $po->id,
                            'supplier_id' => $po->supplier_id,
                            'total_amount' => $poTotal,
                            'paid_amount' => ($paymentStatus == 'partial') ? ($poTotal / 2) : 0,
                            'due_date' => $poTime->copy()->addDays(30)->format('Y-m-d'),
                            'status' => $paymentStatus,
                            'created_at' => $poTime,
                            'updated_at' => $poTime
                        ]);
                    }
                }

                // 4. Incomes / Expenses
                if (rand(1, 100) > 85 && !empty($incomeCats)) {
                    RetailIncome::create([
                        'tenant_id' => $tenantId,
                        'finance_category_id' => $fakerElem($incomeCats),
                        'nominal' => rand(50000, 300000),
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'keterangan' => 'Pemasukan tambahan',
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                }

                if (rand(1, 100) > 75 && !empty($expenseCats)) {
                    RetailExpense::create([
                        'tenant_id' => $tenantId,
                        'finance_category_id' => $fakerElem($expenseCats),
                        'nominal' => rand(20000, 150000),
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'keterangan' => 'Pengeluaran operasional',
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                }

                // 5. Mutasi Kas (Setor Tunai)
                if ($currentDate->dayOfWeek == Carbon::FRIDAY) { // Setiap Jumat setor tunai
                    RetailCashTransfer::create([
                        'tenant_id' => $tenantId,
                        'transfer_date' => $currentDate->format('Y-m-d'),
                        'from_method' => 'Tunai',
                        'to_method' => 'Transfer Bank',
                        'amount' => rand(1000000, 5000000),
                        'note' => 'Setor tunai mingguan ke Bank',
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                }
                
                // 6. Stock Opname & Returns (Random events)
                if (rand(1, 100) > 95) { // Sangat jarang (5% chance per day)
                    $so = RetailStockOpname::create([
                        'tenant_id' => $tenantId,
                        'user_id' => $userId,
                        'status' => 'finalized',
                        'note' => 'Audit stok harian',
                        'finalized_at' => $currentDate,
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                    $prod = $products->random();
                    RetailStockOpnameItem::create([
                        'opname_id' => $so->id,
                        'product_id' => $prod->id,
                        'system_qty' => 10,
                        'physical_qty' => 9,
                        'difference' => -1,
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                }

                if (rand(1, 100) > 95 && !empty($suppliers)) { // Supplier Return
                    $sr = RetailSupplierReturn::create([
                        'tenant_id' => $tenantId,
                        'supplier_id' => $fakerElem($suppliers),
                        'user_id' => $userId,
                        'return_number' => 'RET-' . $currentDate->format('Ymd') . '-' . rand(1000, 9999),
                        'reason' => 'Barang cacat pabrik',
                        'status' => 'completed',
                        'note' => 'Barang cacat pabrik',
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                    $prod = $products->random();
                    $retQty = rand(1, 3);
                    RetailSupplierReturnItem::create([
                        'return_id' => $sr->id,
                        'product_id' => $prod->id,
                        'product_name' => $prod->name,
                        'quantity' => $retQty,
                        'unit_price' => $prod->price_buy,
                        'subtotal' => $prod->price_buy * $retQty,
                        'created_at' => $currentDate,
                        'updated_at' => $currentDate
                    ]);
                }

                // 5. Incomes (Pendapatan Lain-lain)
                if (rand(1, 100) > 85) { // 15% chance per day
                    $incTime = (clone $currentDate)->startOfDay()->addHours(rand(10, 16));
                    \App\Models\RetailIncome::create([
                        'tenant_id' => $tenantId,
                        'tanggal' => $incTime->format('Y-m-d'),
                        'kategori' => $fakerElem(['Sponsor', 'Sewa Lapak', 'Fee Supplier', 'Lain-lain']),
                        'keterangan' => 'Pemasukan tambahan ' . rand(10, 99),
                        'nominal' => rand(1, 10) * 50000, // 50k to 500k
                        'created_at' => $incTime,
                        'updated_at' => $incTime
                    ]);
                }

                $currentDate->addDay();
            }

            // Buka shift hari ini agar bisa dipakai
            RetailShift::create([
                'tenant_id' => $tenantId,
                'user_id' => $userId, 
                'opened_at' => Carbon::now()->startOfDay()->addHours(8),
                'opening_cash' => 500000,
                'status' => 'open',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            DB::commit();
            // echo "Finished generating 1 month of dummy data for {$tenantName}.\n";
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}

