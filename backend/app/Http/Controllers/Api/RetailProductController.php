<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\RetailProduct;

class RetailProductController extends Controller {
    private function rules(bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes|required' : 'required';

        return [
            'name'        => "$required|string|max:255",
            'sku'         => "$required|string|max:255",
            'unit'        => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:retail_categories,id',
            'supplier_id' => 'nullable|integer|exists:retail_suppliers,id',
            'stock'       => 'nullable|numeric|min:0',
            'stock_min'   => 'nullable|numeric|min:0',
            'price_buy'   => 'nullable|numeric|min:0',
            'price_sell'  => 'nullable|numeric|min:0',
        ];
    }

    private const FILLABLE = [
        'name', 'sku', 'unit', 'category_id', 'supplier_id',
        'stock', 'stock_min', 'price_buy', 'price_sell',
    ];

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

        $validator = Validator::make($request->all(), $this->rules());
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = RetailProduct::create($request->only(self::FILLABLE));
        return response()->json($product);
    }

    public function update(Request $request, $id) {
        $product = RetailProduct::findOrFail($id);

        $validator = Validator::make($request->all(), $this->rules(true));
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->only(self::FILLABLE));
        return response()->json($product);
    }

    public function destroy(Request $request, $id) {
        RetailProduct::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
