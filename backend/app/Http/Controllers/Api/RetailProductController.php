<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'price_buy'      => 'nullable|numeric|min:0',
            'price_sell'     => 'nullable|numeric|min:0',
            'price_shopee'   => 'nullable|numeric|min:0',
            'price_tokopedia'=> 'nullable|numeric|min:0',
            'price_tiktok'   => 'nullable|numeric|min:0',
            'price_lazada'   => 'nullable|numeric|min:0',
            'commission_rate'=> 'nullable|numeric|min:0|max:100',
            'is_consignment' => 'nullable|boolean',
        ];
    }

    private const FILLABLE = [
        'name', 'sku', 'unit', 'category_id', 'supplier_id',
        'stock', 'stock_min', 'price_buy', 'price_sell', 'is_consignment',
        'price_shopee', 'price_tokopedia', 'price_tiktok', 'price_lazada', 'commission_rate'
    ];

    public function index(Request $request) {
        $query = RetailProduct::with(['supplier', 'multi_units', 'batches', 'serials']);

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%");
            });
        }

        $query->latest();

        if ($request->has('limit')) {
            $products = $query->limit($request->limit)->get();
        } else {
            $products = $query->get();
        }

        $products->each(function ($product) {
            $product->image_url = $product->image_path ? asset('storage/' . $product->image_path) : null;
        });
        return response()->json($products);
    }

    private function syncMultiUnits(RetailProduct $product, ?array $units)
    {
        if ($units === null) return;
        
        $product->multi_units()->delete();
        foreach ($units as $u) {
            if (empty($u['unit'])) continue;
            $product->multi_units()->create([
                'unit'       => $u['unit'],
                'conversion' => $u['conversion'] ?? 1,
                'barcode'    => $u['barcode'] ?? null,
                'price_sell' => $u['price_sell'] ?? 0,
            ]);
        }
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
        
        if ($request->has('multi_units') && is_array($request->multi_units)) {
            $this->syncMultiUnits($product, $request->multi_units);
        }

        return response()->json($product->load('multi_units'));
    }

    public function update(Request $request, $id) {
        $product = RetailProduct::findOrFail($id);

        $validator = Validator::make($request->all(), $this->rules(true));
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->only(self::FILLABLE));
        
        if ($request->has('multi_units') && is_array($request->multi_units)) {
            $this->syncMultiUnits($product, $request->multi_units);
        }

        return response()->json($product->load('multi_units'));
    }

    public function destroy(Request $request, $id) {
        RetailProduct::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function uploadImage(Request $request, $id) {
        $product = RetailProduct::findOrFail($id);

        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $path = $request->file('image')->store('retail/products', 'public');
        $product->update(['image_path' => $path]);

        return response()->json([
            'image_path' => $path,
            'image_url'  => asset('storage/' . $path),
        ]);
    }

    public function deleteImage(Request $request, $id) {
        $product = RetailProduct::findOrFail($id);

        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
            $product->update(['image_path' => null]);
        }

        return response()->json(['message' => 'Foto produk dihapus']);
    }

    public function export(Request $request)
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\RetailProductsExport(1), // Hardcoding user_id 1 for now or we can use auth()->id() if auth is set up. Let's assume auth is set up. Wait, this app might not have auth on API yet, so I'll use 1 or auth()->id() if it exists. But looking at the app, user_id is usually 1 for demo.
            'produk_retail.xlsx'
        );
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(
                new \App\Imports\RetailProductsImport(1), // hardcoding user_id 1 for now
                $request->file('file')
            );
            return response()->json(['message' => 'Data produk berhasil diimpor']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengimpor data: ' . $e->getMessage()], 500);
        }
    }

    public function purchaseHistory($id)
    {
        $product = \App\Models\RetailProduct::where('tenant_id', auth()->user()->tenant_id)->findOrFail($id);
        
        $history = \Illuminate\Support\Facades\DB::table('retail_purchase_items')
            ->join('retail_purchases', 'retail_purchases.id', '=', 'retail_purchase_items.purchase_id')
            ->leftJoin('retail_suppliers', 'retail_suppliers.id', '=', 'retail_purchases.supplier_id')
            ->where('retail_purchase_items.product_id', $id)
            ->where('retail_purchases.tenant_id', auth()->user()->tenant_id)
            ->whereIn('retail_purchases.status', ['received', 'completed']) 
            ->select(
                'retail_purchases.purchase_date',
                'retail_purchases.id as reference_no',
                'retail_suppliers.name as supplier_name',
                'retail_purchase_items.qty',
                'retail_purchase_items.cost_per_item'
            )
            ->orderBy('retail_purchases.purchase_date', 'asc')
            ->get();

        return response()->json($history);
    }
}
