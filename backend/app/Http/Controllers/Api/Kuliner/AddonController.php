<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\StoreAddonRequest;
use App\Models\KulinerAddon;
use App\Models\KulinerProduct;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index(Request $request)
    {
        $addons = KulinerAddon::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($addons);
    }

    public function store(StoreAddonRequest $request)
    {
        $addon = KulinerAddon::create($request->validated() + ['tenant_id' => $request->user()->tenant_id]);

        return response()->json($addon, 201);
    }

    public function update(StoreAddonRequest $request, int $id)
    {
        $addon = KulinerAddon::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $addon->update($request->validated());

        return response()->json($addon);
    }

    public function destroy(Request $request, int $id)
    {
        $addon = KulinerAddon::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $addon->delete();

        return response()->json(['message' => 'Add-on dihapus']);
    }

    public function attachToProduct(Request $request, int $product, int $addon)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($product);
        $addon = KulinerAddon::where('tenant_id', $request->user()->tenant_id)->findOrFail($addon);

        $product->addons()->syncWithoutDetaching([$addon->id]);

        return response()->json(['message' => 'Add-on terpasang ke produk']);
    }

    public function detachFromProduct(Request $request, int $product, int $addon)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($product);
        $product->addons()->detach($addon);

        return response()->json(['message' => 'Add-on dilepas dari produk']);
    }
}
