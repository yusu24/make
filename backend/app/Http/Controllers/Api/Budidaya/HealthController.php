<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHealth;
use App\Models\BudidayaAnimal;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Record health event (vaccination, medicine, vitamin, mortality, checkup)
     */
    public function store(Request $request, $cycleId = null)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'cycle_id'        => 'nullable|exists:budidaya_cycles,id',
            'animal_id'       => 'nullable|exists:budidaya_animals,id',
            'action_type'     => 'nullable|in:health_check,vaccination,medication,vitamin,quarantine,mortality',
            'mortality_count' => 'nullable|integer|min:0',
            'disease_note'    => 'nullable|string',
            'treatment_note'  => 'nullable|string',
            'medicine_name'   => 'nullable|string|max:150',
            'dosage'          => 'nullable|numeric|min:0',
            'dosage_unit'     => 'nullable|string|max:50',
            'date'            => 'required|date',
        ]);

        $targetCycleId = $cycleId ?? $validated['cycle_id'] ?? null;
        $cycle = $targetCycleId ? BudidayaCycle::where('tenant_id', $tenantId)->find($targetCycleId) : null;
        $mortalityCount = $validated['mortality_count'] ?? 0;
        $actionType = $validated['action_type'] ?? ($mortalityCount > 0 ? 'mortality' : 'health_check');

        DB::transaction(function () use ($cycle, $validated, $mortalityCount, $actionType, $tenantId) {
            // 1. Record Health Log
            BudidayaHealth::create([
                'cycle_id'        => $cycle?->id,
                'animal_id'       => $validated['animal_id'] ?? null,
                'action_type'     => $actionType,
                'mortality_count' => $mortalityCount,
                'disease_note'    => $validated['disease_note'] ?? null,
                'treatment_note'  => $validated['treatment_note'] ?? null,
                'medicine_name'   => $validated['medicine_name'] ?? null,
                'dosage'          => $validated['dosage'] ?? null,
                'dosage_unit'     => $validated['dosage_unit'] ?? null,
                'date'            => $validated['date'],
            ]);

            // 2. Reduce population count in cycle if mortality logged
            if ($cycle && $mortalityCount > 0) {
                $cycle->decrement('seed_count', $mortalityCount);
            }

            // 3. Update individual animal status if linked
            if (!empty($validated['animal_id'])) {
                $animal = BudidayaAnimal::where('id', $validated['animal_id'])->where('tenant_id', $tenantId)->first();
                if ($animal) {
                    if ($actionType === 'mortality') {
                        $animal->update(['status' => 'deceased', 'exit_date' => $validated['date'], 'exit_reason' => $validated['disease_note'] ?? 'Kematian']);
                    } elseif ($actionType === 'quarantine') {
                        $animal->update(['status' => 'quarantine']);
                    }
                }
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kesehatan dan penanganan berhasil dicatat'
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'action_type'     => 'nullable|in:health_check,vaccination,medication,vitamin,quarantine,mortality',
            'mortality_count' => 'nullable|integer|min:0',
            'disease_note'    => 'nullable|string',
            'treatment_note'  => 'nullable|string',
            'medicine_name'   => 'nullable|string|max:150',
            'dosage'          => 'nullable|numeric|min:0',
            'dosage_unit'     => 'nullable|string|max:50',
            'date'            => 'required|date',
        ]);

        $health = BudidayaHealth::findOrFail($id);
        $cycle = $health->cycle;
        $newMortality = $validated['mortality_count'] ?? 0;

        DB::transaction(function () use ($health, $cycle, $validated, $newMortality) {
            if ($cycle) {
                $diff = $newMortality - $health->mortality_count;
                if ($diff != 0) {
                    $cycle->decrement('seed_count', $diff);
                }
            }
            $health->update([
                'action_type'     => $validated['action_type'] ?? $health->action_type,
                'mortality_count' => $newMortality,
                'disease_note'    => $validated['disease_note'] ?? $health->disease_note,
                'treatment_note'  => $validated['treatment_note'] ?? $health->treatment_note,
                'medicine_name'   => $validated['medicine_name'] ?? $health->medicine_name,
                'dosage'          => $validated['dosage'] ?? $health->dosage,
                'dosage_unit'     => $validated['dosage_unit'] ?? $health->dosage_unit,
                'date'            => $validated['date'],
            ]);
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kesehatan berhasil diperbarui'
        ]);
    }

    public function destroy($id)
    {
        $health = BudidayaHealth::findOrFail($id);
        $cycle = $health->cycle;

        DB::transaction(function () use ($health, $cycle) {
            if ($cycle && $health->mortality_count > 0) {
                $cycle->increment('seed_count', $health->mortality_count);
            }
            $health->delete();
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kesehatan berhasil dihapus'
        ]);
    }
}
