<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use App\Models\BudidayaSpecies;
use Illuminate\Http\Request;

class SpeciesController extends Controller
{
    /**
     * List species available for tenant (system default + tenant custom)
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $category = $request->query('category');

        $query = BudidayaSpecies::where(function ($q) use ($tenantId) {
            $q->whereNull('tenant_id')->orWhere('tenant_id', $tenantId);
        });

        if ($category) {
            $query->where('category', $category);
        }

        $species = $query->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $species,
        ]);
    }

    /**
     * Create a custom species for tenant
     */
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'category'               => 'required|in:aquaculture,poultry,livestock,bird,other',
            'name'                   => 'required|string|max:150',
            'scientific_name'        => 'nullable|string|max:150',
            'default_unit'           => 'nullable|string|max:50',
            'target_fcr'             => 'nullable|numeric|min:0',
            'harvest_days_target'    => 'nullable|integer|min:1',
            'incubation_days'        => 'nullable|integer|min:1',
            'gestation_days'         => 'nullable|integer|min:1',
            'recommended_parameters' => 'nullable|array',
        ]);

        $validated['tenant_id'] = $tenantId;
        $validated['code'] = 'CUSTOM-' . strtoupper(substr($validated['category'], 0, 2)) . '-' . time();

        $species = BudidayaSpecies::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Spesies baru berhasil ditambahkan',
            'data'    => $species,
        ], 201);
    }

    /**
     * Update custom species
     */
    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $species = BudidayaSpecies::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $validated = $request->validate([
            'name'                   => 'sometimes|required|string|max:150',
            'scientific_name'        => 'nullable|string|max:150',
            'default_unit'           => 'nullable|string|max:50',
            'target_fcr'             => 'nullable|numeric|min:0',
            'harvest_days_target'    => 'nullable|integer|min:1',
            'incubation_days'        => 'nullable|integer|min:1',
            'gestation_days'         => 'nullable|integer|min:1',
            'recommended_parameters' => 'nullable|array',
            'is_active'              => 'nullable|boolean',
        ]);

        $species->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Spesies berhasil diperbarui',
            'data'    => $species,
        ]);
    }

    /**
     * Delete custom species
     */
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $species = BudidayaSpecies::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $species->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Spesies berhasil dihapus',
        ]);
    }
}
