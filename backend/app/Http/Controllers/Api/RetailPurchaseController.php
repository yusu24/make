<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\RetailPurchase;
use App\Models\RetailPurchaseItem;
use App\Models\RetailProduct;
use App\Models\RetailProductBatch;
use App\Models\RetailProductSerial;
use App\Services\Retail\RetailStockService;
use Illuminate\Support\Facades\DB;

class RetailPurchaseController extends Controller {
    public function __construct(private RetailStockService $stock) {}

    public function index(Request $request) {
        return response()->json(RetailPurchase::with(['items.product', 'supplier', 'outlet'])->latest()->get());
    }

    public function show(Request $request, $id) {
        $purchase = RetailPurchase::with(['items.product', 'supplier', 'outlet'])->findOrFail($id);
        return response()->json($purchase);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'nullable|integer|exists:retail_suppliers,id',
            'outlet_id' => 'nullable|integer|exists:retail_outlets,id',
            'purchase_date' => 'nullable|date',
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:pending,received,cancelled',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:retail_products,id',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.cost_per_item' => 'required|numeric|min:0',
            // Phase 2 additions
            'items.*.batch_no' => 'nullable|string',
            'items.*.expired_date' => 'nullable|date',
            'items.*.serial_numbers' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $totalCost = collect($request->items)->sum(fn ($item) => $item['qty'] * $item['cost_per_item']);
            $status = $request->status ?? 'received';

            $purchase = RetailPurchase::create([
                'tenant_id' => auth()->user()->tenant_id,
                'supplier_id' => $request->supplier_id,
                'outlet_id' => $request->outlet_id,
                'total_cost' => $totalCost,
                'purchase_date' => $request->purchase_date ?? date('Y-m-d'),
                'expected_date' => $request->expected_date,
                'status' => $status,
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

                if ($status === 'received') {
                    $this->processReceivedItem($purchase, $item);
                }
            }

            return response()->json($purchase->load('items'));
        });
    }

    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required|string|in:pending,received,cancelled']);
        
        return DB::transaction(function () use ($request, $id) {
            $purchase = RetailPurchase::with('items')->findOrFail($id);
            
            if ($purchase->status === 'received' && $request->status !== 'received') {
                return response()->json(['message' => 'Cannot change status of an already received PO.'], 400);
            }

            if ($purchase->status === 'pending' && $request->status === 'received') {
                $reqItems = $request->input('items', []);
                $itemsMap = collect($reqItems)->keyBy('product_id');

                foreach ($purchase->items as $item) {
                    $reqItem = $itemsMap->get($item->product_id);
                    $qty = $reqItem['qty'] ?? $item->qty;
                    $cost = $reqItem['cost_per_item'] ?? $item->cost_per_item;
                    
                    // Update purchase item with actual received qty/cost
                    $item->update([
                        'qty' => $qty,
                        'cost_per_item' => $cost,
                        'subtotal' => $qty * $cost,
                    ]);

                    $this->processReceivedItem($purchase, [
                        'product_id' => $item->product_id,
                        'qty' => $qty,
                        'cost_per_item' => $cost,
                        'batch_no' => $reqItem['batch_no'] ?? null,
                        'expired_date' => $reqItem['expired_date'] ?? null,
                    ]);
                }
                
                // Update total_cost of purchase based on updated items
                $totalCost = $purchase->items()->sum('subtotal');
                $purchase->update(['total_cost' => $totalCost]);
            }

            $purchase->update(['status' => $request->status]);
            return response()->json($purchase);
        });
    }

    private function processReceivedItem(RetailPurchase $purchase, array $item) {
        $product = RetailProduct::find($item['product_id']);
        if ($product) {
            $this->stock->addStock($product, $item['qty'], $purchase, "Pembelian #{$purchase->id}", $purchase->outlet_id);
            $product->update(['price_buy' => $item['cost_per_item']]);

            if (!empty($item['expired_date']) || !empty($item['batch_no'])) {
                $batchNo = !empty($item['batch_no']) ? $item['batch_no'] : 'B-'.date('ymd', strtotime($item['expired_date'] ?? date('Y-m-d'))).'-'.rand(1000,9999);
                RetailProductBatch::create([
                    'tenant_id' => $purchase->tenant_id,
                    'product_id' => $product->id,
                    'outlet_id' => $purchase->outlet_id,
                    'batch_no' => $batchNo,
                    'expired_date' => $item['expired_date'] ?? null,
                    'stock' => $item['qty']
                ]);
            }

            if (!empty($item['serial_numbers'])) {
                foreach ($item['serial_numbers'] as $sn) {
                    RetailProductSerial::create([
                        'tenant_id' => $purchase->tenant_id,
                        'product_id' => $product->id,
                        'outlet_id' => $purchase->outlet_id,
                        'serial_number' => $sn,
                        'status' => 'available'
                    ]);
                }
            }
        }
    }

    public function destroy(Request $request, $id) {
        $purchase = RetailPurchase::with('items')->findOrFail($id);

        try {
            DB::transaction(function () use ($purchase) {
                if ($purchase->status === 'received') {
                    foreach ($purchase->items as $item) {
                        $product = RetailProduct::find($item->product_id);
                        if ($product) {
                            $this->stock->deduct($product, $item->qty, $purchase, "Pembatalan pembelian #{$purchase->id}", $purchase->outlet_id);
                        }
                    }
                }
                $purchase->items()->delete();
                $purchase->delete();
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Pembelian dibatalkan']);
    }
}
