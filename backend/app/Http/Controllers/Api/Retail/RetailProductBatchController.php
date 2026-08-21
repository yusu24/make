<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailProductBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RetailProductBatchController extends Controller
{
    public function index(Request $request)
    {
        $tenantSlug = $request->user()->tenant_id;
        $tenant = \App\Models\Tenant::where('tenant_id', $tenantSlug)->first();
        if (!$tenant) {
            return response()->json([]);
        }
        $tenantId = $tenant->id;

        $query = RetailProductBatch::with(['product', 'outlet'])->where('tenant_id', $tenantId);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        $batches = $query->latest()->get();
        return response()->json($batches);
    }

    public function store(Request $request)
    {
        $tenantSlug = $request->user()->tenant_id;
        $tenantId = \App\Models\Tenant::where('tenant_id', $tenantSlug)->value('id');
        
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:retail_products,id',
            'outlet_id' => 'required|exists:retail_outlets,id',
            'batch_no' => 'required|string|max:255',
            'expired_date' => 'nullable|date',
            'stock' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if batch already exists in this outlet
        $existing = RetailProductBatch::where('tenant_id', $tenantId)
            ->where('product_id', $request->product_id)
            ->where('outlet_id', $request->outlet_id)
            ->where('batch_no', $request->batch_no)
            ->first();

        if ($existing) {
            $existing->stock += $request->stock;
            $existing->save();
            return response()->json($existing->load(['product', 'outlet']));
        }

        $batch = RetailProductBatch::create(array_merge($request->all(), ['tenant_id' => $tenantId]));
        
        return response()->json($batch->load(['product', 'outlet']));
    }

    public function update(Request $request, $id)
    {
        $batch = RetailProductBatch::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'batch_no' => 'required|string|max:255',
            'expired_date' => 'nullable|date',
            'stock' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $batch->update($request->only(['batch_no', 'expired_date', 'stock']));
        
        return response()->json($batch->load(['product', 'outlet']));
    }

    public function destroy($id)
    {
        RetailProductBatch::findOrFail($id)->delete();
        return response()->json(['message' => 'Batch dihapus']);
    }
}
