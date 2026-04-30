<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KulinerOrder;
use App\Models\KulinerOrderItem;
use App\Models\KulinerSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KulinerOrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'order_type' => 'required|string|in:dine_in,take_away',
            'table_number' => 'nullable|string|max:50',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Find tenant_id from first settings record for public demo
        $settings = KulinerSetting::first();
        $tenant_id = $settings ? $settings->tenant_id : 'TN-PUBLIC';

        try {
            return DB::transaction(function () use ($request, $tenant_id) {
                $orderNumber = 'ORD-' . strtoupper(Str::random(8));
                
                $totalAmount = collect($request->items)->reduce(function ($carry, $item) {
                    return $carry + ($item['price'] * $item['quantity']);
                }, 0);

                $serviceFee = 2000;

                $order = KulinerOrder::create([
                    'tenant_id' => $tenant_id,
                    'order_number' => $orderNumber,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->customer_phone,
                    'customer_address' => $request->customer_address,
                    'order_type' => $request->order_type,
                    'table_number' => $request->table_number,
                    'payment_method' => $request->payment_method,
                    'total_amount' => $totalAmount,
                    'service_fee' => $serviceFee,
                    'status' => 'pending',
                    'notes' => $request->notes,
                ]);

                foreach ($request->items as $item) {
                    KulinerOrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['id'] ?? null,
                        'product_name' => $item['name'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);
                }

                return response()->json([
                    'message' => 'Pesanan berhasil dikirim!',
                    'order_number' => $orderNumber,
                    'order_id' => $order->id
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat pesanan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
