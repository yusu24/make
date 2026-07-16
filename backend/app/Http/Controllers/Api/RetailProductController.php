<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailProduct;

class RetailProductController extends Controller {
    public function index(Request $request) {
        return response()->json(RetailProduct::with('supplier')->latest()->get());
    }

    public function store(Request $request) {
        $user = $request->user();
        $plan = \App\Models\SubscriptionPlan::forTenant($user->tenant);

        if ($plan && $plan->max_products !== null) {
            $currentCount = RetailProduct::count();
            if ($currentCount >= $plan->max_products) {
                return response()->json(['message' => "Batas jumlah produk tercapai (Maks {$plan->max_products}). Silakan upgrade paket."], 422);
            }
        }

        $product = RetailProduct::create($request->all());
        return response()->json($product);
    }

    public function update(Request $request, $id) {
        $product = RetailProduct::findOrFail($id);
        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy(Request $request, $id) {
        RetailProduct::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
