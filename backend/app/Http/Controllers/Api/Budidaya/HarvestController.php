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
        ]);

        DB::transaction(function () use ($cycle, $validated) {
            // 1. Record Harvest
            $totalRevenue = $validated['weight_kg'] * $validated['price_per_kg'];
            BudidayaHarvest::create([
                'cycle_id' => $cycle->id,
                'weight_kg' => $validated['weight_kg'],
                'price_per_kg' => $validated['price_per_kg'],
                'total_revenue' => $totalRevenue,
                'date' => $validated['date'],
                'notes' => $validated['notes'],
            ]);

            // 2. Close Cycle
            $cycle->update([
                'status' => 'panen'
            ]);
        });

        return response()->json(['message' => 'Panen berhasil dicatat. Siklus selesai.']);
    }
}
