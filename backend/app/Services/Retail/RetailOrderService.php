<?php

namespace App\Services\Retail;

use App\Models\RetailCustomer;
use App\Models\RetailDiscount;
use App\Models\RetailPricelist;
use App\Models\RetailProduct;
use App\Models\RetailSetting;
use App\Models\RetailTransaction;
use App\Models\RetailTransactionItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RetailOrderService
{
    public function __construct(private RetailStockService $stock)
    {
    }

    public function checkout(array $data, User $user): RetailTransaction
    {
        return DB::transaction(function () use ($data, $user) {
            $tenantId = $user->tenant_id;
            $requestedItems = collect($data['items']);
            $productIds = $requestedItems->pluck('product_id')->unique();

            $products = RetailProduct::whereIn('id', $productIds)->get()->keyBy('id');
            if ($products->count() !== $productIds->count()) {
                throw new \RuntimeException('Salah satu produk tidak ditemukan.');
            }

            $pricelist = null;
            if (!empty($data['pricelist_id'])) {
                $pricelist = RetailPricelist::with('items')->find($data['pricelist_id']);
            }

            $subtotal = 0;
            $lineItems = [];
            foreach ($requestedItems as $reqItem) {
                $product = $products[$reqItem['product_id']];
                $qty = (float) $reqItem['qty'];
                $unit = $reqItem['unit'] ?? null;
                $conversion = (float) ($reqItem['conversion'] ?? 1);
                $deductQty = $qty * $conversion;

                if ($product->stock < $deductQty) {
                    throw new \RuntimeException("Stok produk '{$product->name}' tidak mencukupi. Tersedia: {$product->stock}, diminta: {$deductQty} (setara).");
                }

                // If unit was passed, we trust the frontend's price_sell calculation because frontend resolved it 
                // However, we should ideally fetch it from DB for security, but for now we'll rely on product base price 
                // OR we fetch it from the JSON. Let's fetch from multi_units in DB to be safe!
                $price = $pricelist?->priceFor($product->id, $qty) ?? (float) $product->price_sell;
                if ($unit) {
                    $matchedUnit = collect($product->multi_units)->firstWhere('unit', $unit);
                    if ($matchedUnit) {
                        $price = (float) $matchedUnit['price_sell'];
                    }
                }

                $lineSubtotal = $price * $qty;
                $subtotal += $lineSubtotal;

                $batchNo = $reqItem['batch_no'] ?? null;
                $serialNumber = $reqItem['serial_number'] ?? null;

                if ($serialNumber) {
                    $serial = \App\Models\RetailProductSerial::where('product_id', $product->id)
                        ->where('serial_number', $serialNumber)
                        ->first();
                    if (!$serial || $serial->status !== 'available') {
                        throw new \RuntimeException("Serial Number '{$serialNumber}' untuk produk '{$product->name}' tidak tersedia.");
                    }
                }

                if ($batchNo) {
                    $batch = \App\Models\RetailProductBatch::where('product_id', $product->id)
                        ->where('batch_no', $batchNo)
                        ->first();
                    if (!$batch || $batch->stock < $deductQty) {
                        throw new \RuntimeException("Stok batch '{$batchNo}' untuk produk '{$product->name}' tidak mencukupi.");
                    }
                }

                $lineItems[] = [
                    'product' => $product,
                    'qty' => $qty,
                    'deduct_qty' => $deductQty,
                    'unit' => $unit,
                    'conversion' => $conversion,
                    'price' => $price,
                    'subtotal' => $lineSubtotal,
                    'batch_no' => $batchNo,
                    'serial_number' => $serialNumber,
                ];
            }

            $discount = null;
            $discountAmount = 0;
            if (!empty($data['discount_code'])) {
                $discount = RetailDiscount::where('code', $data['discount_code'])->first();
                if (!$discount || !$discount->isValidFor($subtotal)) {
                    throw new \RuntimeException('Kode diskon tidak valid atau sudah tidak berlaku.');
                }
                $discountAmount = $discount->calculateDiscount($subtotal, $lineItems);
                $discount->increment('used_count');
            }

            $settings = RetailSetting::firstOrCreate(['tenant_id' => $tenantId], ['tax_rate' => 0, 'points_ratio' => 10000, 'point_value_rupiah' => 1]);
            
            $pointsRedeemed = 0;
            $pointsDiscountAmount = 0;
            $customer = null;

            if (!empty($data['customer_id'])) {
                $customer = RetailCustomer::lockForUpdate()->find($data['customer_id']);
                $redeemRequested = (int) ($data['redeem_points'] ?? 0);
                if ($customer && $redeemRequested > 0 && $settings->enable_loyalty) {
                    if ($customer->points < $redeemRequested) {
                        throw new \RuntimeException('Poin pelanggan tidak mencukupi untuk ditukarkan.');
                    }
                    $pointsRedeemed = $redeemRequested;
                    $pointsDiscountAmount = $pointsRedeemed * (float) $settings->point_value_rupiah;
                }
            }

            // Points discount cannot exceed subtotal after normal discount
            $pointsDiscountAmount = min($pointsDiscountAmount, max(0, $subtotal - $discountAmount));

            $taxRate = (float) $settings->tax_rate / 100;
            $taxableAmount = max(0, $subtotal - $discountAmount - $pointsDiscountAmount);
            $taxAmount = round($taxableAmount * $taxRate, 2);
            $total = $taxableAmount + $taxAmount;

            $paymentMethods = $data['payment_methods'] ?? [];
            if (empty($paymentMethods)) {
                $paymentMethods = [
                    ['method' => $data['payment_method'] ?? 'CASH', 'amount' => (float) ($data['payment_amount'] ?? $total)]
                ];
            }

            $totalPaid = 0;
            $cashAmount = 0;
            foreach ($paymentMethods as $pm) {
                $amt = (float) $pm['amount'];
                $totalPaid += $amt;
                if (strtoupper($pm['method']) === 'CASH') {
                    $cashAmount += $amt;
                }
            }

            if ($totalPaid < $total) {
                throw new \RuntimeException('Jumlah pembayaran kurang dari total transaksi.');
            }
            $changeAmount = max(0, $totalPaid - $total);

            $primaryPaymentMethod = count($paymentMethods) > 1 ? 'SPLIT' : strtoupper($paymentMethods[0]['method']);

            $transaction = RetailTransaction::create([
                'user_id' => $user->id,
                'outlet_id' => $data['outlet_id'] ?? null,
                'customer_id' => $data['customer_id'] ?? null,
                'sales_id' => $data['sales_id'] ?? null,
                'invoice_no' => $this->generateInvoiceNumber(),
                'total_amount' => $total,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'payment_method' => $primaryPaymentMethod,
                'status' => 'paid',
                'paid_amount' => $totalPaid,
                'change_amount' => $changeAmount,
                'discount_id' => $discount?->id,
                'pricelist_id' => $pricelist?->id,
                'note' => $data['note'] ?? null,
                'points_redeemed' => $pointsRedeemed,
                'points_discount_amount' => $pointsDiscountAmount,
            ]);

            foreach ($paymentMethods as $pm) {
                \App\Models\RetailTransactionPayment::create([
                    'transaction_id' => $transaction->id,
                    'payment_method' => strtoupper($pm['method']),
                    'amount' => (float) $pm['amount'],
                ]);
            }

            foreach ($lineItems as $item) {
                RetailTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product']->id,
                    'unit' => $item['unit'],
                    'conversion' => $item['conversion'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'cost_price' => $item['product']->price_buy ?? 0,
                    'subtotal' => $item['subtotal'],
                    'batch_no' => $item['batch_no'],
                    'serial_number' => $item['serial_number']
                ]);

                $this->stock->deduct($item['product'], $item['deduct_qty'], $transaction, "Penjualan {$transaction->invoice_no}", $data['outlet_id'] ?? null);

                // Deduct batch stock
                if ($item['batch_no']) {
                    $batch = \App\Models\RetailProductBatch::where('product_id', $item['product']->id)
                        ->where('batch_no', $item['batch_no'])
                        ->first();
                    if ($batch) {
                        $batch->stock -= $item['deduct_qty'];
                        $batch->save();
                    }
                }

                // Update serial status
                if ($item['serial_number']) {
                    $serial = \App\Models\RetailProductSerial::where('product_id', $item['product']->id)
                        ->where('serial_number', $item['serial_number'])
                        ->first();
                    if ($serial) {
                        $serial->status = 'sold';
                        $serial->save();
                    }
                }
            }

            if ($customer && $settings->enable_loyalty) {
                $this->processLoyalty($transaction, $customer, $settings);
            }

            // --- FINANCE INTEGRATION: Trigger Finance Event ---
            // Assume account ID 1 as default Cash account for Retail, since Retail doesn't ask for account ID in checkout payload.
            // Ideally, this should come from $data['account_id'] or Tenant Settings.
            $accountId = $data['account_id'] ?? 1; 

            event(new \App\Events\Finance\BusinessTransactionPosted(
                $tenantId,
                'income',
                $transaction->paid_amount, // Emit the amount paid, as it goes to cash
                'retail',
                'retail_transaction',
                $transaction->id,
                "Retail Sales: {$transaction->invoice_no}",
                $accountId,
                now()
            ));

            return $transaction->load('items.product');
        });
    }

    public function void(RetailTransaction $transaction, User $user, ?string $reason = null): RetailTransaction
    {
        if ($transaction->isVoided()) {
            throw new \RuntimeException('Transaksi ini sudah dibatalkan sebelumnya.');
        }
        if (!$transaction->isPaid()) {
            throw new \RuntimeException('Hanya transaksi berstatus paid yang dapat dibatalkan.');
        }
        if (!$transaction->canBeVoidedBy($user)) {
            throw new \RuntimeException('Kasir hanya bisa membatalkan transaksi sendiri di hari yang sama.');
        }

        return DB::transaction(function () use ($transaction, $user, $reason) {
            foreach ($transaction->items as $item) {
                if ($item->product) {
                    $conversion = (float) ($item->conversion ?? 1);
                    $restoreQty = $item->qty * $conversion;
                    $this->stock->restore($item->product, $restoreQty, $transaction, "Void {$transaction->invoice_no}", $transaction->outlet_id);
                }
            }

            if ($transaction->discount_id) {
                $transaction->discount()->decrement('used_count');
            }

            if ($transaction->customer_id) {
                $customer = RetailCustomer::lockForUpdate()->find($transaction->customer_id);
                $settings = RetailSetting::where('tenant_id', $transaction->tenant_id)->first();
                if ($customer && $settings && $settings->enable_loyalty) {
                    $this->reverseLoyalty($transaction, $customer, $settings);
                }
            }

            $transaction->update([
                'status' => 'voided',
                'voided_at' => now(),
                'voided_by' => $user->id,
                'void_reason' => $reason,
            ]);

            return $transaction;
        });
    }

    private function processLoyalty(RetailTransaction $transaction, RetailCustomer $customer, RetailSetting $settings): void
    {
        $ratio = $settings->points_ratio ?: 10000;
        // Points are earned based on final total paid (or subtotal), typically total amount.
        $earned = (int) floor($transaction->total_amount / $ratio);
        
        $transaction->update(['points_earned' => $earned]);

        $totalSpent = $customer->total_spent + $transaction->total_amount;
        $newPoints = $customer->points - $transaction->points_redeemed + $earned;

        $customer->update([
            'points' => max(0, $newPoints),
            'total_spent' => $totalSpent,
            'tier' => $this->tierFor($totalSpent),
        ]);
    }

    private function reverseLoyalty(RetailTransaction $transaction, RetailCustomer $customer, RetailSetting $settings): void
    {
        $earned = $transaction->points_earned;
        $redeemed = $transaction->points_redeemed;
        
        $totalSpent = max(0, $customer->total_spent - $transaction->total_amount);
        $newPoints = $customer->points - $earned + $redeemed;

        $customer->update([
            'points' => max(0, $newPoints),
            'total_spent' => $totalSpent,
            'tier' => $this->tierFor($totalSpent),
        ]);
    }

    private function tierFor(float $totalSpent): string
    {
        if ($totalSpent >= 5_000_000) {
            return 'gold';
        }
        if ($totalSpent >= 1_000_000) {
            return 'silver';
        }
        return 'regular';
    }

    private function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $last = RetailTransaction::where('invoice_no', 'like', "INV-{$date}-%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        $seq = $last ? ((int) substr($last->invoice_no, -5)) + 1 : 1;

        return sprintf('INV-%s-%05d', $date, $seq);
    }
}
