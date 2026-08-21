<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailStockTransfer;
use App\Models\RetailStockTransferItem;
use App\Models\RetailProduct;
use App\Services\Retail\RetailStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RetailStockTransferController extends Controller
{
    public function __construct(private RetailStockService $stockService)
    {
    }

    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $transfers = RetailStockTransfer::with(['fromOutlet', 'toOutlet', 'user', 'items.product'])
            ->where('tenant_id', $tenantId)
            ->latest()
            ->get();
            
        return response()->json($transfers);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'from_outlet_id' => 'required|exists:retail_outlets,id',
            'to_outlet_id' => 'required|exists:retail_outlets,id|different:from_outlet_id',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:retail_products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request, $user) {
            $referenceNo = 'TRF-' . now()->format('Ymd') . '-' . rand(1000, 9999);
            
            $transfer = RetailStockTransfer::create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'from_outlet_id' => $request->from_outlet_id,
                'to_outlet_id' => $request->to_outlet_id,
                'reference_no' => $referenceNo,
                'status' => 'pending',
                'note' => $request->note,
            ]);

            foreach ($request->items as $itemData) {
                $product = RetailProduct::findOrFail($itemData['product_id']);
                
                // Deduct stock from source outlet immediately
                $this->stockService->deduct(
                    $product, 
                    $itemData['quantity'], 
                    $transfer, 
                    "Transfer Keluar ke Cabang ID: {$request->to_outlet_id}", 
                    $request->from_outlet_id
                );

                RetailStockTransferItem::create([
                    'transfer_id' => $transfer->id,
                    'product_id' => $product->id,
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? null,
                ]);
            }

            return response()->json($transfer->load('items.product'));
        });
    }

    public function show(Request $request, $id)
    {
        $transfer = RetailStockTransfer::with(['fromOutlet', 'toOutlet', 'user', 'items.product'])->findOrFail($id);
        return response()->json($transfer);
    }

    public function confirm(Request $request, $id)
    {
        $transfer = RetailStockTransfer::findOrFail($id);
        
        if ($transfer->status !== 'pending') {
            return response()->json(['message' => 'Hanya transfer berstatus pending yang bisa dikonfirmasi.'], 400);
        }

        DB::transaction(function () use ($transfer) {
            foreach ($transfer->items as $item) {
                $product = RetailProduct::findOrFail($item->product_id);
                // Add stock to destination outlet
                $this->stockService->addStock(
                    $product, 
                    $item->quantity, 
                    $transfer, 
                    "Penerimaan Transfer dari Cabang ID: {$transfer->from_outlet_id}", 
                    $transfer->to_outlet_id
                );
            }
            
            $transfer->update(['status' => 'completed']);
        });

        return response()->json(['message' => 'Transfer berhasil dikonfirmasi.']);
    }

    public function cancel(Request $request, $id)
    {
        $transfer = RetailStockTransfer::findOrFail($id);
        
        if ($transfer->status !== 'pending') {
            return response()->json(['message' => 'Hanya transfer berstatus pending yang bisa dibatalkan.'], 400);
        }

        DB::transaction(function () use ($transfer) {
            foreach ($transfer->items as $item) {
                $product = RetailProduct::findOrFail($item->product_id);
                // Return stock to source outlet
                $this->stockService->restore(
                    $product, 
                    $item->quantity, 
                    $transfer, 
                    "Pembatalan Transfer", 
                    $transfer->from_outlet_id
                );
            }
            
            $transfer->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Transfer berhasil dibatalkan.']);
    }
}
