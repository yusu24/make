<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    /**
     * Create a new income or expense transaction.
     *
     * @param array $data
     * @return Transaction
     */
    public function createTransaction(array $data)
    {
        return DB::transaction(function () use ($data) {
            $transaction = Transaction::create([
                'tenant_id' => $data['tenant_id'],
                'type' => $data['type'], // income or expense
                'source' => $data['source'] ?? 'manual',
                'reference_id' => $data['reference_id'] ?? null,
                'amount' => $data['amount'],
                'description' => $data['description'] ?? '',
                'date' => $data['date'] ?? now()->toDateString(),
            ]);

            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $transaction->items()->create([
                        'product_id' => $item['product_id'],
                        'qty' => $item['qty'],
                        'price' => $item['price'],
                        'subtotal' => $item['qty'] * $item['price'],
                    ]);

                    // Adjust product stock
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        if ($data['type'] === 'income') {
                            $product->decrement('stock', $item['qty']); // Selling reduces stock
                        } else {
                            $product->increment('stock', $item['qty']); // Buying increases stock (if type is expense for purchase)
                        }
                    }
                }
            }

            return $transaction;
        });
    }
}
