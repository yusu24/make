<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHealth;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function store(Request $request, $cycleId)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($cycleId);

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen)'], 400);
        }

        $validated = $request->validate([
            'mortality_count' => 'required|integer|min:0',
            'disease_note' => 'nullable|string',
            'treatment_note' => 'nullable|string',
            'date' => 'required|date',
        ]);

        DB::transaction(function () use ($cycle, $validated) {
            // 1. Record Health/Mortality
            BudidayaHealth::create([
                'cycle_id' => $cycle->id,
                'mortality_count' => $validated['mortality_count'],
                'disease_note' => $validated['disease_note'],
                'treatment_note' => $validated['treatment_note'],
                'date' => $validated['date'],
            ]);

            // 2. Reduce fish count in cycle
            if ($validated['mortality_count'] > 0) {
                $cycle->decrement('seed_count', $validated['mortality_count']);
            }
        });

        return response()->json(['message' => 'Data kesehatan dan kematian berhasil dicatat']);
    }
}
