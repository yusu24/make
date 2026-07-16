<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailPricelist;
use App\Models\RetailPricelistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RetailPricelistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(RetailPricelist::with('items.product')->latest()->get());
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $pricelist = RetailPricelist::create($request->only(['name', 'type']));

            foreach ($request->input('items', []) as $item) {
                RetailPricelistItem::create([
                    'pricelist_id' => $pricelist->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'min_qty' => $item['min_qty'] ?? 1,
                ]);
            }

            return response()->json($pricelist->load('items.product'), 201);
        });
    }

    public function update(Request $request, int $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $pricelist = RetailPricelist::findOrFail($id);
            $pricelist->update($request->only(['name', 'type']));

            if ($request->has('items')) {
                $pricelist->items()->delete();
                foreach ($request->input('items', []) as $item) {
                    RetailPricelistItem::create([
                        'pricelist_id' => $pricelist->id,
                        'product_id' => $item['product_id'],
                        'price' => $item['price'],
                        'min_qty' => $item['min_qty'] ?? 1,
                    ]);
                }
            }

            return response()->json($pricelist->load('items.product'));
        });
    }

    public function destroy(Request $request, int $id)
    {
        RetailPricelist::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
