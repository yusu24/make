<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailProduct;

class RetailProductController extends Controller {
    public function index(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(RetailProduct::where('tenant_id', $tenantId)->latest()->get());
    }
    public function store(Request $request) {
        $user = $request->user();
        $tenantId = $user->tenant_id ?? 'TN-001';
        $plan = $user->tenant?->subscription_plan ?? 'free';

        // Limit Enforcement
        $currentCount = RetailProduct::where('tenant_id', $tenantId)->count();
        if ($plan === 'free' && $currentCount >= 20) {
            return response()->json(['message' => 'Batas jumlah produk tercapai (Maks 20). Silakan upgrade ke paket Basic/Pro.'], 422);
        }
        if ($plan === 'basic' && $currentCount >= 500) {
            return response()->json(['message' => 'Batas jumlah produk tercapai (Maks 500). Silakan upgrade ke paket Pro.'], 422);
        }

        $product = RetailProduct::create(array_merge($request->all(), ['tenant_id' => $tenantId]));
        return response()->json($product);
    }
    public function update(Request $request, $id) {
        $product = RetailProduct::findOrFail($id);
        $product->update($request->all());
        return response()->json($product);
    }
    public function destroy($id) {
        RetailProduct::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
