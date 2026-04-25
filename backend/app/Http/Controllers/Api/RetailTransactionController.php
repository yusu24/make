<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailTransaction;
use App\Models\RetailTransactionItem;
use App\Models\RetailProduct;
use Illuminate\Support\Facades\DB;

class RetailTransactionController extends Controller {
    public function store(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        
        return DB::transaction(function() use ($request, $tenantId) {
            $transaction = RetailTransaction::create([
                'tenant_id' => $tenantId,
                'user_id' => $request->user()->id ?? null,
                'customer_id' => $request->customer_id,
                'invoice_no' => 'INV-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(2))),
                'total_amount' => $request->total_amount,
                'payment_method' => $request->payment_method ?? 'CASH',
                'paid_amount' => $request->paid_amount ?? $request->total_amount,
                'change_amount' => $request->change_amount ?? 0,
            ]);

            foreach ($request->items as $item) {
                RetailTransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $item['qty'] * $item['price']
                ]);

                // Reduce Stock
                $product = RetailProduct::find($item['id']);
                if ($product) {
                    $product->decrement('stock', $item['qty']);
                    
                    // Check Low Stock
                    $newStock = $product->stock - $item['qty']; // decrement happens above, but in the same transaction
                    // Wait, decrement already updated it. Let's refresh.
                    $product->refresh();
                    if ($product->stock <= ($product->stock_min ?? 0)) {
                        \App\Models\Notification::create([
                            'user_id' => $request->user()->id,
                            'tenant_id' => $tenantId,
                            'type' => 'warning',
                            'title' => 'Stok Menipis! ⚠️',
                            'message' => "Stok produk '" . ($product->name) . "' tersisa " . ($product->stock) . ". Segera lakukan pemesanan ulang.",
                            'data' => ['link' => '/retail/inventory', 'product_id' => $product->id]
                        ]);
                    }
                }
            }
            return response()->json($transaction->load('items'));
        });
    }
}
