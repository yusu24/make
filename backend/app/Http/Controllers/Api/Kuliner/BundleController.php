<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\StoreBundleRequest;
use App\Models\KulinerBundle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BundleController extends Controller
{
    public function index(Request $request)
    {
        $bundles = KulinerBundle::with('items.product')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json($bundles);
    }

    public function show(Request $request, int $id)
    {
        $bundle = KulinerBundle::with('items.product')
            ->where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        return response()->json($bundle);
    }

    public function store(StoreBundleRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $bundle = KulinerBundle::create([
                'tenant_id' => $request->user()->tenant_id,
                'name' => $request->name,
                'description' => $request->description,
                'bundle_price' => $request->bundle_price,
                'image_url' => $request->image_url,
                'is_active' => $request->input('is_active', true),
            ]);

            $this->insertItems($bundle, $request->items);

            return response()->json($bundle->fresh('items.product'), 201);
        });
    }

    public function update(StoreBundleRequest $request, int $id)
    {
        $bundle = KulinerBundle::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        return DB::transaction(function () use ($request, $bundle) {
            $bundle->update([
                'name' => $request->name,
                'description' => $request->description,
                'bundle_price' => $request->bundle_price,
                'image_url' => $request->image_url,
                'is_active' => $request->input('is_active', true),
            ]);

            $bundle->items()->delete();
            $this->insertItems($bundle, $request->items);

            return response()->json($bundle->fresh('items.product'));
        });
    }

    public function destroy(Request $request, int $id)
    {
        $bundle = KulinerBundle::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $bundle->delete();

        return response()->json(['message' => 'Bundle dihapus']);
    }

    private function insertItems(KulinerBundle $bundle, array $items): void
    {
        if (empty($items)) {
            return;
        }

        $now = now();
        $bundle->items()->insert(array_map(fn ($item) => [
            'bundle_id' => $bundle->id,
            'product_id' => $item['product_id'],
            'quantity' => $item['quantity'],
            'created_at' => $now,
            'updated_at' => $now,
        ], $items));
    }
}
