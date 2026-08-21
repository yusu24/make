<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailHoldTransaction;
use Illuminate\Http\Request;

class RetailHoldTransactionController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;
        
        $holds = RetailHoldTransaction::with('customer')
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($holds);
    }

    public function store(Request $request)
    {
        $request->validate([
            'reference_name' => 'required|string|max:255',
            'cart_data' => 'required|array',
            'total_amount' => 'required|numeric'
        ]);

        $hold = RetailHoldTransaction::create([
            'tenant_id' => auth()->user()->tenant_id,
            'user_id' => auth()->id(),
            'customer_id' => $request->customer_id,
            'reference_name' => $request->reference_name,
            'cart_data' => $request->cart_data,
            'total_amount' => $request->total_amount,
        ]);

        return response()->json($hold, 201);
    }

    public function destroy($id)
    {
        $tenantId = auth()->user()->tenant_id;
        $hold = RetailHoldTransaction::where('tenant_id', $tenantId)->findOrFail($id);
        
        $hold->delete();
        
        return response()->json(['message' => 'Hold transaction deleted.']);
    }
}
