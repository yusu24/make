<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use Illuminate\Validation\Rule;

class PondController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $status = $request->query('status');
        $area = $request->query('area');

        $query = BudidayaPond::where('tenant_id', $tenantId);

        if ($status) {
            $query->where('status', $status);
        }

        if ($area) {
            $query->where('area', $area);
        }

        $ponds = $query->orderBy('area')->orderBy('name')->get();
        return response()->json(['data' => $ponds]);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'name' => 'required|string',
            'code' => [
                'nullable',
                'string',
                Rule::unique('budidaya_ponds')->where('tenant_id', $tenantId)
            ],
            'type' => 'required|string',
            'area' => 'nullable|string',
            'area_m2' => 'nullable|numeric',
            'depth_cm' => 'nullable|numeric',
            'max_fish_count' => 'nullable|numeric',
            'location' => 'nullable|string'
        ]);

        $code = $request->code;
        if (!$code) {
           $count = BudidayaPond::where('tenant_id', $tenantId)->count() + 1;
           $code = 'KL-' . str_pad($count, 3, '0', STR_PAD_LEFT);
           
           // Ensure generated code is actually unique (in case of deletions)
           while (BudidayaPond::where('tenant_id', $tenantId)->where('code', $code)->exists()) {
               $count++;
               $code = 'KL-' . str_pad($count, 3, '0', STR_PAD_LEFT);
           }
        }

        $pond = BudidayaPond::create(array_merge($request->all(), [
            'tenant_id' => $tenantId,
            'code' => $code,
            'status' => 'kosong'
        ]));

        return response()->json(['message' => 'Kolam berhasil ditambahkan', 'data' => $pond]);
    }

    public function show(Request $request, $id)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $pond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($id);
        
        // Include summary of active cycle if exists
        $activeCycle = BudidayaCycle::where('pond_id', $pond->id)
            ->where('status', '!=', 'panen')
            ->first();

        return response()->json([
            'data' => $pond,
            'active_cycle' => $activeCycle
        ]);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $pond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($id);
        
        $request->validate([
            'name' => 'required|string',
            'code' => [
                'required',
                'string',
                Rule::unique('budidaya_ponds')->where('tenant_id', $tenantId)->ignore($id)
            ],
            'type' => 'required|string',
            'area' => 'nullable|string',
            'area_m2' => 'nullable|numeric',
            'depth_cm' => 'nullable|numeric',
            'max_fish_count' => 'nullable|numeric',
            'location' => 'nullable|string',
            'status' => 'required|in:kosong,aktif,panen,maintenance'
        ]);

        // Logic check: cannot set to 'aktif' manually if no cycle started
        // Actually, let lifecycle handle it, but allow 'maintenance' toggle
        $pond->update($request->all());
        
        return response()->json(['message' => 'Data kolam diperbarui', 'data' => $pond]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $pond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($id);
        
        // CHECK HISTORY: Check if any cycles (active or finished) exist
        $historyCount = BudidayaCycle::where('pond_id', $pond->id)->count();
        
        if ($historyCount > 0) {
            return response()->json([
                'message' => 'Kolam tidak bisa dihapus karena memiliki riwayat siklus (panen/aktif). Silakan gunakan status Maintenance jika tidak ingin digunakan.'
            ], 422);
        }

        $pond->delete();
        return response()->json(['message' => 'Kolam berhasil dihapus']);
    }
}
