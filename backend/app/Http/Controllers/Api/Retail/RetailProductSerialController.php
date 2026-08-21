<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailProductSerial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RetailProductSerialController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $query = RetailProductSerial::with(['product', 'outlet'])->where('tenant_id', $tenantId);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $serials = $query->latest()->get();
        return response()->json($serials);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:retail_products,id',
            'outlet_id' => 'nullable|exists:retail_outlets,id',
            'serial_number' => 'required|string|max:255',
            'status' => 'required|in:available,sold,returned,defective',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if serial already exists for this product
        $existing = RetailProductSerial::where('product_id', $request->product_id)
            ->where('serial_number', $request->serial_number)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Serial Number sudah ada untuk produk ini.'], 422);
        }

        $serial = RetailProductSerial::create(array_merge($request->all(), ['tenant_id' => $tenantId]));
        
        return response()->json($serial->load(['product', 'outlet']));
    }

    public function update(Request $request, $id)
    {
        $serial = RetailProductSerial::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'serial_number' => 'required|string|max:255',
            'status' => 'required|in:available,sold,returned,defective',
            'outlet_id' => 'nullable|exists:retail_outlets,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $serial->update($request->only(['serial_number', 'status', 'outlet_id']));
        
        return response()->json($serial->load(['product', 'outlet']));
    }

    public function destroy($id)
    {
        RetailProductSerial::findOrFail($id)->delete();
        return response()->json(['message' => 'Serial Number dihapus']);
    }
}
