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

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'mortality_count' => 'required|integer|min:0',
            'disease_note' => 'nullable|string',
            'treatment_note' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $health = BudidayaHealth::findOrFail($id);
        $cycle = $health->cycle;

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat mengubah data kesehatan.'], 400);
        }

        DB::transaction(function () use ($health, $cycle, $validated) {
            $diff = $validated['mortality_count'] - $health->mortality_count;
            if ($diff != 0) {
                $cycle->decrement('seed_count', $diff);
            }
            $health->update([
                'mortality_count' => $validated['mortality_count'],
                'disease_note' => $validated['disease_note'],
                'treatment_note' => $validated['treatment_note'],
                'date' => $validated['date'],
            ]);
        });

        return response()->json(['message' => 'Data kesehatan berhasil diperbarui']);
    }

    public function destroy($id)
    {
        $health = BudidayaHealth::findOrFail($id);
        $cycle = $health->cycle;

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat menghapus data kesehatan.'], 400);
        }

        DB::transaction(function () use ($health, $cycle) {
            if ($health->mortality_count > 0) {
                $cycle->increment('seed_count', $health->mortality_count);
            }
            $health->delete();
        });

        return response()->json(['message' => 'Data kesehatan berhasil dihapus']);
    }
}
