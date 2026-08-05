<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SellerWarehouse;

class SellerWarehouseController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $warehouses = SellerWarehouse::where('tenant_id', $tenantId)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $warehouses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'pic_name' => 'nullable|string|max:100',
            'pic_phone' => 'nullable|string|max:50',
            'is_default' => 'boolean'
        ]);

        $tenantId = $request->user()->tenant_id;

        // If this is set as default, unset other defaults
        if ($request->is_default) {
            SellerWarehouse::where('tenant_id', $tenantId)->update(['is_default' => false]);
        } 
        // If there are no warehouses yet, make this one the default automatically
        else {
            $count = SellerWarehouse::where('tenant_id', $tenantId)->count();
            if ($count === 0) {
                $request->merge(['is_default' => true]);
            }
        }

        $warehouse = SellerWarehouse::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'code' => $request->code,
            'city' => $request->city,
            'address' => $request->address,
            'pic_name' => $request->pic_name,
            'pic_phone' => $request->pic_phone,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gudang berhasil ditambahkan',
            'data' => $warehouse
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $warehouse = SellerWarehouse::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'pic_name' => 'nullable|string|max:100',
            'pic_phone' => 'nullable|string|max:50',
            'is_default' => 'boolean'
        ]);

        if ($request->is_default) {
            SellerWarehouse::where('tenant_id', $tenantId)->where('id', '!=', $warehouse->id)->update(['is_default' => false]);
        }

        $warehouse->update([
            'name' => $request->name,
            'code' => $request->code,
            'city' => $request->city,
            'address' => $request->address,
            'pic_name' => $request->pic_name,
            'pic_phone' => $request->pic_phone,
            'is_default' => $request->is_default ?? $warehouse->is_default,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gudang berhasil diperbarui',
            'data' => $warehouse
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $warehouse = SellerWarehouse::where('tenant_id', $tenantId)->findOrFail($id);
        $wasDefault = $warehouse->is_default;

        $warehouse->delete();

        // If the default warehouse was removed, promote the oldest remaining one so
        // there's always exactly one default whenever at least one warehouse exists.
        if ($wasDefault) {
            $next = SellerWarehouse::where('tenant_id', $tenantId)->orderBy('created_at', 'asc')->first();
            if ($next) {
                $next->update(['is_default' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Gudang berhasil dihapus'
        ]);
    }
}
