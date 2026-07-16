<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailDiscount;
use Illuminate\Http\Request;

class RetailDiscountController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(RetailDiscount::latest()->get());
    }

    public function store(Request $request)
    {
        $discount = RetailDiscount::create($request->only([
            'code', 'name', 'type', 'value', 'min_purchase', 'max_uses', 'is_active', 'starts_at', 'expires_at',
        ]));
        return response()->json($discount, 201);
    }

    public function update(Request $request, int $id)
    {
        $discount = RetailDiscount::findOrFail($id);
        $discount->update($request->only([
            'code', 'name', 'type', 'value', 'min_purchase', 'max_uses', 'is_active', 'starts_at', 'expires_at',
        ]));
        return response()->json($discount);
    }

    public function destroy(Request $request, int $id)
    {
        RetailDiscount::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function validateCode(Request $request)
    {
        $discount = RetailDiscount::where('code', $request->code)->first();
        if (!$discount || !$discount->isValidFor((float) $request->subtotal)) {
            return response()->json(['message' => 'Kode diskon tidak valid atau sudah tidak berlaku.'], 422);
        }

        $amount = $discount->calculateDiscount((float) $request->subtotal);

        return response()->json([
            'id' => $discount->id,
            'code' => $discount->code,
            'name' => $discount->name,
            'type' => $discount->type,
            'value' => $discount->value,
            'min_purchase' => $discount->min_purchase,
            'discount_amount' => $amount,
        ]);
    }
}
