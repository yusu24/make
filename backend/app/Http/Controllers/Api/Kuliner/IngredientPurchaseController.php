<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Models\KulinerPurchase;
use App\Models\KulinerPurchaseItem;
use App\Services\Kuliner\IngredientStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IngredientPurchaseController extends Controller
{
    public function __construct(private IngredientStockService $stockService)
    {
    }

    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $query = KulinerPurchase::with(['supplier', 'createdBy'])
            ->where('tenant_id', $tenantId);

        if ($search = $request->query('search')) {
            $query->where('reference_no', 'like', "%{$search}%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $sort = $request->query('sort', 'purchase_date');
        $dir = $request->query('dir', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $dir);

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'nullable|exists:kuliner_suppliers,id',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.ingredient_id' => 'required|exists:kuliner_ingredients,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $tenantId = $request->user()->tenant_id;

        DB::beginTransaction();
        try {
            $purchase = KulinerPurchase::create([
                'tenant_id' => $tenantId,
                'supplier_id' => $request->supplier_id,
                'purchase_date' => $request->purchase_date,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'notes' => $request->notes,
                'created_by' => $request->user()->id,
            ]);

            $total = 0;
            foreach ($request->items as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $total += $subtotal;

                $purchase->items()->create([
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }

            $purchase->update(['total_amount' => $total]);

            DB::commit();
            return response()->json($purchase->load('items.ingredient'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat purchase order', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $purchase = KulinerPurchase::with(['supplier', 'items.ingredient', 'createdBy'])
            ->where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        return response()->json($purchase);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,received,cancelled',
            'payment_status' => 'required|in:unpaid,paid',
        ]);

        $purchase = KulinerPurchase::with('items.ingredient')
            ->where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        if ($purchase->status === 'received' && $request->status !== 'received') {
            return response()->json(['message' => 'Tidak bisa mengubah status purchase yang sudah diterima'], 422);
        }

        if ($purchase->status === 'cancelled') {
            return response()->json(['message' => 'Purchase sudah dibatalkan'], 422);
        }

        DB::beginTransaction();
        try {
            $purchase->update([
                'status' => $request->status,
                'payment_status' => $request->payment_status,
            ]);

            if ($request->status === 'received') {
                foreach ($purchase->items as $item) {
                    // Update the last_price of the ingredient
                    $item->ingredient->update(['last_price' => $item->unit_price]);
                    
                    // Increment stock
                    $this->stockService->addStock(
                        $item->ingredient, 
                        $item->quantity, 
                        $purchase, 
                        'Pembelian dari Supplier'
                    );
                }
                
                // If it's paid, we can also record an expense if needed. 
                // But for now, we just update the purchase record.
            }

            DB::commit();
            return response()->json($purchase);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal update status', 'error' => $e->getMessage()], 500);
        }
    }
}
