<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\StoreSupplierRequest;
use App\Models\KulinerSupplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = KulinerSupplier::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json($suppliers);
    }

    public function store(StoreSupplierRequest $request)
    {
        $supplier = KulinerSupplier::create($request->validated() + ['tenant_id' => $request->user()->tenant_id]);

        return response()->json($supplier, 201);
    }

    public function update(StoreSupplierRequest $request, int $id)
    {
        $supplier = KulinerSupplier::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $supplier->update($request->validated());

        return response()->json($supplier);
    }

    public function destroy(Request $request, int $id)
    {
        $supplier = KulinerSupplier::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Supplier dihapus']);
    }
}
