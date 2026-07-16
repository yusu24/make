<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailPurchase;
use App\Models\RetailPurchaseItem;
use App\Models\RetailProduct;
use App\Services\Retail\RetailStockService;
use Illuminate\Support\Facades\DB;

class RetailPurchaseController extends Controller {
    public function __construct(private RetailStockService $stock) {}

    public function index(Request $request) {
        return response()->json(RetailPurchase::with(['items.product', 'supplier'])->latest()->get());
    }

    public function store(Request $request) {
        return DB::transaction(function () use ($request) {
            $totalCost = collect($request->items)->sum(fn ($item) => $item['qty'] * $item['cost_per_item']);

            $purchase = RetailPurchase::create([
                'supplier_id' => $request->supplier_id,
                'total_cost' => $totalCost,
                'purchase_date' => $request->purchase_date ?? date('Y-m-d'),
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                RetailPurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'cost_per_item' => $item['cost_per_item'],
                    'subtotal' => $item['qty'] * $item['cost_per_item'],
                ]);

                $product = RetailProduct::find($item['product_id']);
                if ($product) {
                    $this->stock->addStock($product, $item['qty'], $purchase, "Pembelian #{$purchase->id}");
                    $product->update(['price_buy' => $item['cost_per_item']]);
                }
            }

            return response()->json($purchase->load('items'));
        });
    }
}
