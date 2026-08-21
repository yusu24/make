<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailOutlet;
use Illuminate\Http\Request;

class RetailOutletController extends Controller
{
    public function index(Request $request)
    {
        $tenantSlug = auth()->user()->tenant_id;
        $tenantId = \App\Models\Tenant::where('tenant_id', $tenantSlug)->value('id');
        
        $outlets = RetailOutlet::where('tenant_id', $tenantId)
            ->orderBy('is_primary', 'desc')
            ->orderBy('name')
            ->get();
            
        return response()->json($outlets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'is_primary' => 'boolean'
        ]);

        $tenantSlug = auth()->user()->tenant_id;
        $tenantId = \App\Models\Tenant::where('tenant_id', $tenantSlug)->value('id');

        if ($request->is_primary) {
            RetailOutlet::where('tenant_id', $tenantId)->update(['is_primary' => false]);
        }

        $outlet = RetailOutlet::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'is_primary' => $request->is_primary ?? false
        ]);

        return response()->json($outlet, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'is_primary' => 'boolean'
        ]);

        $tenantId = auth()->user()->tenant_id;
        $outlet = RetailOutlet::where('tenant_id', $tenantId)->findOrFail($id);

        if ($request->is_primary && !$outlet->is_primary) {
            RetailOutlet::where('tenant_id', $tenantId)->update(['is_primary' => false]);
        }

        $outlet->update($request->only('name', 'address', 'phone', 'is_primary'));

        // Prevent setting all outlets to non-primary
        if (!$request->is_primary && !RetailOutlet::where('tenant_id', $tenantId)->where('is_primary', true)->exists()) {
            $outlet->update(['is_primary' => true]);
        }

        return response()->json($outlet);
    }

    public function destroy($id)
    {
        $tenantId = auth()->user()->tenant_id;
        $outlet = RetailOutlet::where('tenant_id', $tenantId)->findOrFail($id);
        
        if ($outlet->is_primary) {
            return response()->json(['message' => 'Cannot delete primary outlet.'], 400);
        }

        $outlet->delete();
        
        return response()->json(['message' => 'Outlet deleted.']);
    }
}
