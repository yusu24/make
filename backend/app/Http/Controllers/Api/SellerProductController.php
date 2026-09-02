<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellerProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerProductController extends Controller
{
    private function getTenantId(Request $request)
    {
        $user = $request->user();
        return $user ? ($user->tenant_id ?? 'TN-DEMO') : 'TN-DEMO';
    }

    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $query = SellerProduct::where('tenant_id', $tenantId);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $products = $query->orderBy('id', 'desc')->get();

        // Seed initial sample products if tenant is fresh
        if ($products->isEmpty() && !$request->filled('search')) {
            $defaultProducts = [
                ['name' => 'Kemeja Katun Polos Premium', 'sku' => 'KMT-001', 'category' => 'Pakaian', 'price' => 149000, 'cost_price' => 90000, 'stock' => 45, 'min_stock' => 10, 'status' => 'Aktif'],
                ['name' => 'Sepatu Sneakers Running V2', 'sku' => 'SNK-002', 'category' => 'Sepatu', 'price' => 299000, 'cost_price' => 180000, 'stock' => 18, 'min_stock' => 5, 'status' => 'Aktif'],
                ['name' => 'Tas Ransel Anti Air Urban', 'sku' => 'TAS-003', 'category' => 'Aksesoris', 'price' => 189000, 'cost_price' => 110000, 'stock' => 3, 'min_stock' => 5, 'status' => 'Menipis'],
                ['name' => 'Smartwatch Pro Fitness Track', 'sku' => 'SW-004', 'category' => 'Elektronik', 'price' => 450000, 'cost_price' => 280000, 'stock' => 0, 'min_stock' => 5, 'status' => 'Habis'],
            ];

            foreach ($defaultProducts as $dp) {
                SellerProduct::create(array_merge($dp, [
                    'tenant_id' => $tenantId,
                    'marketplace_mappings' => [
                        'shopee' => 'SHP-' . $dp['sku'],
                        'tokopedia' => 'TKP-' . $dp['sku'],
                        'tiktok' => 'TTK-' . $dp['sku']
                    ]
                ]));
            }

            $products = SellerProduct::where('tenant_id', $tenantId)->orderBy('id', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'weight_gram' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'marketplace_mappings' => 'nullable|array'
        ]);

        $validated['tenant_id'] = $tenantId;
        $validated['status'] = $validated['stock'] <= 0 ? 'Habis' : ($validated['stock'] <= ($validated['min_stock'] ?? 5) ? 'Menipis' : 'Aktif');

        $product = SellerProduct::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $product = SellerProduct::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|max:100',
            'category' => 'nullable|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'weight_gram' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'marketplace_mappings' => 'nullable|array'
        ]);

        if (isset($validated['stock'])) {
            $min = $validated['min_stock'] ?? $product->min_stock ?? 5;
            $validated['status'] = $validated['stock'] <= 0 ? 'Habis' : ($validated['stock'] <= $min ? 'Menipis' : 'Aktif');
        }

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil diperbarui',
            'data' => $product
        ]);
    }

    public function updateStock(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $product = SellerProduct::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
            'reason' => 'nullable|string'
        ]);

        $newStock = $validated['stock'];
        $status = $newStock <= 0 ? 'Habis' : ($newStock <= $product->min_stock ? 'Menipis' : 'Aktif');

        $product->update([
            'stock' => $newStock,
            'status' => $status
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Stok produk berhasil disesuaikan',
            'data' => $product
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $product = SellerProduct::where('tenant_id', $tenantId)->findOrFail($id);
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil dihapus'
        ]);
    }
}
