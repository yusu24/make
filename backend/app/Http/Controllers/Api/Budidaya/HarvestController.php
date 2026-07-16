<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use Illuminate\Support\Facades\DB;

class HarvestController extends Controller
{
    public function store(Request $request, $cycleId)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($cycleId);

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen)'], 400);
        }

        $validated = $request->validate([
            'weight_kg' => 'required|numeric|min:1',
            'price_per_kg' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'harvest_type' => 'nullable|string|in:sebagian,total',
        ]);

        DB::transaction(function () use ($cycle, $validated) {
            // 1. Record Harvest
            $totalRevenue = $validated['weight_kg'] * $validated['price_per_kg'];
            BudidayaHarvest::create([
                'cycle_id' => $cycle->id,
                'total_weight_kg' => $validated['weight_kg'],
                'sale_price_per_kg' => $validated['price_per_kg'],
                'total_revenue' => $totalRevenue,
                'harvest_date' => $validated['date'],
                'notes' => $validated['notes'],
            ]);

            // 2. Close Cycle and Reset Pond only if total harvest
            $isTotal = ($validated['harvest_type'] ?? 'total') === 'total';
            if ($isTotal) {
                $cycle->update([
                    'status' => 'panen'
                ]);
                
                $cycle->pond->update([
                    'status' => 'kosong'
                ]);
            } else {
                $cycle->update([
                    'status' => 'panen_sebagian'
                ]);
            }
        });

        return response()->json(['message' => 'Panen berhasil dicatat.']);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $harvest = BudidayaHarvest::findOrFail($id);
        $cycle = $harvest->cycle;

        if ($cycle->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'weight_kg' => 'required|numeric|min:1',
            'price_per_kg' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($harvest, $validated) {
            $totalRevenue = $validated['weight_kg'] * $validated['price_per_kg'];
            $harvest->update([
                'total_weight_kg' => $validated['weight_kg'],
                'sale_price_per_kg' => $validated['price_per_kg'],
                'total_revenue' => $totalRevenue,
                'harvest_date' => $validated['date'],
                'notes' => $validated['notes'],
            ]);
        });

        return response()->json(['message' => 'Data panen berhasil diperbarui']);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $harvest = BudidayaHarvest::findOrFail($id);
        $cycle = $harvest->cycle;

        if ($cycle->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($harvest, $cycle) {
            $harvest->delete();

            $harvestCount = $cycle->harvests()->count();
            if ($harvestCount === 0 && ($cycle->status === 'panen' || $cycle->status === 'panen_sebagian')) {
                $cycle->update(['status' => 'pembesaran']);
                $cycle->pond->update(['status' => 'aktif']);
            }
        });

        return response()->json(['message' => 'Data panen berhasil dihapus']);
    }
}
