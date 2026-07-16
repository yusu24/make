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

                if ($product->stock < $qty) {
                    throw new \RuntimeException("Stok produk '{$product->name}' tidak mencukupi. Tersedia: {$product->stock}, diminta: {$qty}.");
                }

                $price = $pricelist?->priceFor($product->id, $qty) ?? (float) $product->price_sell;
                $lineSubtotal = $price * $qty;
                $subtotal += $lineSubtotal;

                $lineItems[] = [
                    'product' => $product,
                    'qty' => $qty,
                    'price' => $price,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $discount = null;
            $discountAmount = 0;
            if (!empty($data['discount_code'])) {
                $discount = RetailDiscount::where('code', $data['discount_code'])->first();
                if (!$discount || !$discount->isValidFor($subtotal)) {
                    throw new \RuntimeException('Kode diskon tidak valid atau sudah tidak berlaku.');
                }
                $discountAmount = $discount->calculateDiscount($subtotal);
                $discount->increment('used_count');
            }

            $settings = RetailSetting::firstOrCreate(['tenant_id' => $tenantId], ['tax_rate' => 0, 'points_ratio' => 10000]);
            $taxRate = (float) $settings->tax_rate / 100;
            $taxAmount = round(($subtotal - $discountAmount) * $taxRate, 2);
            $total = $subtotal - $discountAmount + $taxAmount;

            $paymentMethod = $data['payment_method'] ?? 'CASH';
            $paymentAmount = (float) ($data['payment_amount'] ?? $total);
            if (strtoupper($paymentMethod) === 'CASH' && $paymentAmount < $total) {
                throw new \RuntimeException('Jumlah pembayaran tunai kurang dari total transaksi.');
            }
            $changeAmount = strtoupper($paymentMethod) === 'CASH' ? max(0, $paymentAmount - $total) : 0;

            $transaction = RetailTransaction::create([
                'user_id' => $user->id,
                'customer_id' => $data['customer_id'] ?? null,
                'invoice_no' => $this->generateInvoiceNumber(),
                'total_amount' => $total,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'payment_method' => $paymentMethod,
                'status' => 'paid',
                'paid_amount' => $paymentAmount,
                'change_amount' => $changeAmount,
                'discount_id' => $discount?->id,
                'pricelist_id' => $pricelist?->id,
                'note' => $data['note'] ?? null,
            ]);

            foreach ($lineItems as $item) {
                RetailTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product']->id,
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'cost_price' => $item['product']->price_buy,
                    'subtotal' => $item['subtotal'],
                ]);

                $this->stock->deduct($item['product'], $item['qty'], $transaction, "Penjualan {$transaction->invoice_no}");
            }

            if ($transaction->customer_id) {
                $this->awardPoints($transaction);
            }

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
                    $this->stock->restore($item->product, $item->qty, $transaction, "Void {$transaction->invoice_no}");
                }
            }

            if ($transaction->discount_id) {
                $transaction->discount()->decrement('used_count');
            }

            if ($transaction->customer_id) {
                $this->reversePoints($transaction);
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

    private function awardPoints(RetailTransaction $transaction): void
    {
        $customer = RetailCustomer::lockForUpdate()->find($transaction->customer_id);
        if (!$customer) {
            return;
        }

        $settings = RetailSetting::firstOrCreate(
            ['tenant_id' => $transaction->tenant_id],
            ['tax_rate' => 0, 'points_ratio' => 10000]
        );
        $ratio = $settings->points_ratio ?: 10000;

        $earned = (int) floor($transaction->total_amount / $ratio);
        $totalSpent = $customer->total_spent + $transaction->total_amount;

        $customer->update([
            'points' => $customer->points + $earned,
            'total_spent' => $totalSpent,
            'tier' => $this->tierFor($totalSpent),
        ]);
    }

    private function reversePoints(RetailTransaction $transaction): void
    {
        $customer = RetailCustomer::lockForUpdate()->find($transaction->customer_id);
        if (!$customer) {
            return;
        }

        $settings = RetailSetting::firstOrCreate(
            ['tenant_id' => $transaction->tenant_id],
            ['tax_rate' => 0, 'points_ratio' => 10000]
        );
        $ratio = $settings->points_ratio ?: 10000;

        $earned = (int) floor($transaction->total_amount / $ratio);
        $totalSpent = max(0, $customer->total_spent - $transaction->total_amount);

        $customer->update([
            'points' => max(0, $customer->points - $earned),
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
