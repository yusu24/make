<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use App\Models\BudidayaBreedingPair;
use App\Models\BudidayaBreedingLog;
use App\Models\BudidayaAnimal;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BreedingController extends Controller
{
    /**
     * List all breeding pairs for tenant
     */
    public function indexPairs(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $status = $request->query('status');

        $query = BudidayaBreedingPair::where('tenant_id', $tenantId)
            ->with(['pond', 'maleAnimal', 'femaleAnimal'])
            ->withCount('logs');

        if ($status) {
            $query->where('status', $status);
        }

        $pairs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $pairs,
        ]);
    }

    /**
     * Create breeding pair
     */
    public function storePair(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'pair_code'        => [
                'required',
                'string',
                'max:100',
                Rule::unique('budidaya_breeding_pairs')->where('tenant_id', $tenantId),
            ],
            'name'             => 'nullable|string|max:100',
            'pond_id'          => 'nullable|exists:budidaya_ponds,id',
            'male_animal_id'   => 'nullable|exists:budidaya_animals,id',
            'female_animal_id' => 'nullable|exists:budidaya_animals,id',
            'male_name'        => 'nullable|string|max:100',
            'female_name'      => 'nullable|string|max:100',
            'paired_date'      => 'required|date',
            'status'           => 'nullable|in:active,separated,resting,retired',
            'notes'            => 'nullable|string',
        ]);

        $validated['tenant_id'] = $tenantId;

        // If male or female animal linked, optionally update their status to 'breeding'
        if (!empty($validated['male_animal_id'])) {
            BudidayaAnimal::where('id', $validated['male_animal_id'])->where('tenant_id', $tenantId)->update(['status' => 'breeding']);
        }
        if (!empty($validated['female_animal_id'])) {
            BudidayaAnimal::where('id', $validated['female_animal_id'])->where('tenant_id', $tenantId)->update(['status' => 'breeding']);
        }

        $pair = BudidayaBreedingPair::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pasangan breeding berhasil dibuat',
            'data'    => $pair->load(['pond', 'maleAnimal', 'femaleAnimal']),
        ], 201);
    }

    /**
     * Show single breeding pair with breeding history logs
     */
    public function showPair(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $pair = BudidayaBreedingPair::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->with(['pond', 'maleAnimal', 'femaleAnimal', 'logs'])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => $pair,
        ]);
    }

    /**
     * Update breeding pair
     */
    public function updatePair(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $pair = BudidayaBreedingPair::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $validated = $request->validate([
            'pair_code'        => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('budidaya_breeding_pairs')->where('tenant_id', $tenantId)->ignore($id),
            ],
            'name'             => 'nullable|string|max:100',
            'pond_id'          => 'nullable|exists:budidaya_ponds,id',
            'male_animal_id'   => 'nullable|exists:budidaya_animals,id',
            'female_animal_id' => 'nullable|exists:budidaya_animals,id',
            'male_name'        => 'nullable|string|max:100',
            'female_name'      => 'nullable|string|max:100',
            'paired_date'      => 'sometimes|required|date',
            'status'           => 'nullable|in:active,separated,resting,retired',
            'notes'            => 'nullable|string',
        ]);

        $pair->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pasangan breeding berhasil diperbarui',
            'data'    => $pair->load(['pond', 'maleAnimal', 'femaleAnimal']),
        ]);
    }

    /**
     * Delete breeding pair
     */
    public function destroyPair(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $pair = BudidayaBreedingPair::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $pair->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Pasangan breeding berhasil dihapus',
        ]);
    }

    /**
     * Log breeding event (mating, clutch/egg, pregnancy, incubation, hatch/birth, weaning)
     */
    public function storeLog(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'breeding_pair_id'  => 'nullable|exists:budidaya_breeding_pairs,id',
            'cycle_id'          => 'nullable|exists:budidaya_cycles,id',
            'event_type'        => 'required|in:mating,clutch_egg,pregnancy_check,incubation,hatch_birth,weaning',
            'event_date'        => 'required|date',
            'egg_count'         => 'nullable|integer|min:0',
            'fertile_egg_count' => 'nullable|integer|min:0',
            'hatched_count'     => 'nullable|integer|min:0',
            'born_alive_count'  => 'nullable|integer|min:0',
            'born_dead_count'   => 'nullable|integer|min:0',
            'expected_date'     => 'nullable|date',
            'actual_date'       => 'nullable|date',
            'status'            => 'nullable|in:in_progress,completed,failed',
            'offspring_notes'   => 'nullable|string',
            'notes'             => 'nullable|string',
        ]);

        $validated['tenant_id'] = $tenantId;

        $log = BudidayaBreedingLog::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Catatan breeding berhasil disimpan',
            'data'    => $log,
        ], 201);
    }

    /**
     * Update breeding event log
     */
    public function updateLog(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $log = BudidayaBreedingLog::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $validated = $request->validate([
            'event_type'        => 'sometimes|required|in:mating,clutch_egg,pregnancy_check,incubation,hatch_birth,weaning',
            'event_date'        => 'sometimes|required|date',
            'egg_count'         => 'nullable|integer|min:0',
            'fertile_egg_count' => 'nullable|integer|min:0',
            'hatched_count'     => 'nullable|integer|min:0',
            'born_alive_count'  => 'nullable|integer|min:0',
            'born_dead_count'   => 'nullable|integer|min:0',
            'expected_date'     => 'nullable|date',
            'actual_date'       => 'nullable|date',
            'status'            => 'nullable|in:in_progress,completed,failed',
            'offspring_notes'   => 'nullable|string',
            'notes'             => 'nullable|string',
        ]);

        $log->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Catatan breeding berhasil diperbarui',
            'data'    => $log,
        ]);
    }

    /**
     * Delete breeding log
     */
    public function destroyLog(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $log = BudidayaBreedingLog::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $log->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Catatan breeding berhasil dihapus',
        ]);
    }
}
