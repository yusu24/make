<?php

namespace App\Services\Retail;

use App\Models\RetailCustomerReturn;
use App\Models\RetailCustomerReturnItem;
use App\Models\RetailProduct;
use App\Models\RetailSupplierReturn;
use App\Models\RetailSupplierReturnItem;
use App\Models\RetailTransaction;
use Illuminate\Support\Facades\DB;

class RetailReturnService
{
    public function __construct(private RetailStockService $stock)
    {
    }

    // ─── Supplier returns ────────────────────────────────────────────────

    public function createSupplierReturn(array $data): RetailSupplierReturn
    {
        return DB::transaction(function () use ($data) {
            $return = RetailSupplierReturn::create([
                'supplier_id' => $data['supplier_id'],
                'user_id' => auth()->id(),
                'return_number' => $this->generateNumber(RetailSupplierReturn::class, 'return_number', 'SRT'),
                'reason' => $data['reason'] ?? null,
                'status' => 'draft',
                'note' => $data['note'] ?? null,
                'total_amount' => collect($data['items'])->sum(fn ($i) => $i['quantity'] * $i['unit_price']),
            ]);

            $products = RetailProduct::whereIn('id', collect($data['items'])->pluck('product_id'))->get()->keyBy('id');

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                RetailSupplierReturnItem::create([
                    'return_id' => $return->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product?->name ?? $item['product_name'] ?? 'Produk',
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return $return->load('items');
        });
    }

    public function updateSupplierReturn(RetailSupplierReturn $return, array $data): RetailSupplierReturn
    {
        if ($return->status === 'confirmed') {
            throw new \RuntimeException('Retur supplier ini sudah dikonfirmasi dan tidak dapat diubah.');
        }

        return DB::transaction(function () use ($return, $data) {
            $return->update([
                'supplier_id' => $data['supplier_id'],
                'reason' => $data['reason'] ?? null,
                'note' => $data['note'] ?? null,
                'total_amount' => collect($data['items'])->sum(fn ($i) => $i['quantity'] * $i['unit_price']),
            ]);

            $return->items()->delete();

            $products = RetailProduct::whereIn('id', collect($data['items'])->pluck('product_id'))->get()->keyBy('id');

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                RetailSupplierReturnItem::create([
                    'return_id' => $return->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product?->name ?? $item['product_name'] ?? 'Produk',
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return $return->load('items');
        });
    }

    public function confirmSupplierReturn(RetailSupplierReturn $return): RetailSupplierReturn
    {
        if ($return->status === 'confirmed') {
            throw new \RuntimeException('Retur supplier ini sudah dikonfirmasi.');
        }

        return DB::transaction(function () use ($return) {
            foreach ($return->items as $item) {
                if ($item->product) {
                    $this->stock->supplierReturn($item->product, $item->quantity, $return, "Retur supplier {$return->return_number}");
                }
            }

            $return->update(['status' => 'confirmed']);
            return $return;
        });
    }

    // ─── Customer returns ────────────────────────────────────────────────

    public function createCustomerReturn(array $data): RetailCustomerReturn
    {
        $transaction = RetailTransaction::findOrFail($data['transaction_id']);

        if (!$transaction->isPaid()) {
            throw new \RuntimeException('Hanya transaksi berstatus paid yang dapat diretur.');
        }

        return DB::transaction(function () use ($data, $transaction) {
            $return = RetailCustomerReturn::create([
                'transaction_id' => $transaction->id,
                'customer_id' => $transaction->customer_id,
                'user_id' => auth()->id(),
                'return_number' => $this->generateNumber(RetailCustomerReturn::class, 'return_number', 'CRT'),
                'type' => $data['type'] ?? 'refund',
                'status' => 'draft',
                'note' => $data['note'] ?? null,
                'total_amount' => collect($data['items'])->sum(fn ($i) => $i['quantity'] * $i['unit_price']),
            ]);

            $products = RetailProduct::whereIn('id', collect($data['items'])->pluck('product_id'))->get()->keyBy('id');

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                RetailCustomerReturnItem::create([
                    'return_id' => $return->id,
                    'transaction_item_id' => $item['transaction_item_id'],
                    'product_id' => $item['product_id'],
                    'product_name' => $product?->name ?? $item['product_name'] ?? 'Produk',
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'reason' => $item['reason'] ?? null,
                ]);
            }

            return $return->load('items');
        });
    }

    public function updateCustomerReturn(RetailCustomerReturn $return, array $data): RetailCustomerReturn
    {
        if ($return->status === 'confirmed') {
            throw new \RuntimeException('Retur pelanggan ini sudah dikonfirmasi dan tidak dapat diubah.');
        }

        $transaction = RetailTransaction::findOrFail($data['transaction_id']);

        if (!$transaction->isPaid()) {
            throw new \RuntimeException('Hanya transaksi berstatus paid yang dapat diretur.');
        }

        return DB::transaction(function () use ($return, $data, $transaction) {
            $return->update([
                'transaction_id' => $transaction->id,
                'customer_id' => $transaction->customer_id,
                'type' => $data['type'] ?? 'refund',
                'note' => $data['note'] ?? null,
                'total_amount' => collect($data['items'])->sum(fn ($i) => $i['quantity'] * $i['unit_price']),
            ]);

            $return->items()->delete();

            $products = RetailProduct::whereIn('id', collect($data['items'])->pluck('product_id'))->get()->keyBy('id');

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                RetailCustomerReturnItem::create([
                    'return_id' => $return->id,
                    'transaction_item_id' => $item['transaction_item_id'],
                    'product_id' => $item['product_id'],
                    'product_name' => $product?->name ?? $item['product_name'] ?? 'Produk',
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'reason' => $item['reason'] ?? null,
                ]);
            }

            return $return->load('items');
        });
    }

    public function confirmCustomerReturn(RetailCustomerReturn $return): RetailCustomerReturn
    {
        if ($return->status === 'confirmed') {
            throw new \RuntimeException('Retur pelanggan ini sudah dikonfirmasi.');
        }

        return DB::transaction(function () use ($return) {
            foreach ($return->items as $item) {
                if ($item->product) {
                    $this->stock->customerReturn($item->product, $item->quantity, $return, "Retur pelanggan {$return->return_number}");
                }
            }

            $return->update(['status' => 'confirmed']);
            return $return;
        });
    }

    private function generateNumber(string $modelClass, string $column, string $prefix): string
    {
        $date = now()->format('Ymd');
        $last = $modelClass::where($column, 'like', "{$prefix}-{$date}-%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        $seq = $last ? ((int) substr($last->{$column}, -5)) + 1 : 1;

        return sprintf('%s-%s-%05d', $prefix, $date, $seq);
    }
}
