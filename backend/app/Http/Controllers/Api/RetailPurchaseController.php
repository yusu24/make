<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailPurchase;
use App\Models\RetailPurchaseItem;
use App\Models\RetailProduct;
use Illuminate\Support\Facades\DB;

class RetailPurchaseController extends Controller {
    public function index(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(RetailPurchase::where('tenant_id', $tenantId)->with(['items.product', 'supplier'])->latest()->get());
    }

    public function store(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        
        return DB::transaction(function() use ($request, $tenantId) {
            $purchase = RetailPurchase::create([
                'tenant_id' => $tenantId,
                'supplier_id' => $request->supplier_id,
                'total_cost' => $request->total_cost,
                'purchase_date' => $request->purchase_date ?? date('Y-m-d'),
                'notes' => $request->notes
            ]);

            foreach ($request->items as $item) {
                RetailPurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'cost_per_item' => $item['cost_per_item'],
                    'subtotal' => $item['qty'] * $item['cost_per_item']
                ]);

                // Increase Stock & Update Cost Price
                $product = RetailProduct::find($item['product_id']);
                if ($product) {
                    $product->increment('stock', $item['qty']);
                    $product->update(['price_buy' => $item['cost_per_item']]);
                }
            }
            return response()->json($purchase->load('items'));
        });
    }
}
