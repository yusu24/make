<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\PosTransaction;
use App\Models\Product;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RetailPosController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validate stock before proceeding
        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            if ($product->stock < $item['qty']) {
                return response()->json([
                    'message' => "Stok tidak cukup untuk produk: {$product->name}. Tersisa: {$product->stock}"
                ], 422);
            }
        }

        return DB::transaction(function () use ($request) {
            $total = collect($request->items)->sum(function ($item) {
                return $item['qty'] * $item['price'];
            });

            // 1. Save to pos_transactions
            $posTx = PosTransaction::create([
                'total' => $total,
                'payment_method' => $request->payment_method,
            ]);

            // 2. Call TransactionService to record income and reduce stock
            $this->transactionService->createTransaction([
                'type' => 'income',
                'source' => 'retail_pos',
                'reference_id' => $posTx->id,
                'amount' => $total,
                'description' => "Penjualan POS Retail - ID: {$posTx->id}",
                'items' => $request->items
            ]);

            return response()->json([
                'message' => 'Transaksi POS berhasil',
                'data' => $posTx
            ], 201);
        });
    }
}
