<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use Illuminate\Support\Facades\DB;

class HarvestController extends Controller
{
    /**
     * Record production output / harvest (Meat biomass, eggs, milk, live count, offspring)
     */
    public function store(Request $request, $cycleId)
    {
        $tenantId = $request->user()->tenant_id;
        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($cycleId);

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen total)'], 400);
        }

        $validated = $request->validate([
            'output_type'       => 'nullable|in:meat_biomass,eggs,milk,live_count,offspring',
            'weight_kg'         => 'nullable|numeric|min:0',
            'total_count'       => 'nullable|integer|min:0',
            'unit_label'        => 'nullable|string|max:50',
            'price_per_kg'      => 'nullable|numeric|min:0',
            'total_revenue'     => 'nullable|numeric|min:0',
            'date'              => 'required|date',
            'notes'             => 'nullable|string',
            'harvest_type'      => 'nullable|string|in:sebagian,total,daily_collection',
            'grade_breakdown'   => 'nullable|array',
        ]);

        $outputType = $validated['output_type'] ?? 'meat_biomass';
        $weightKg = $validated['weight_kg'] ?? null;
        $pricePerUnit = $validated['price_per_kg'] ?? 0;
        $totalCount = $validated['total_count'] ?? null;

        // Auto calculate revenue if not provided
        $revenue = $validated['total_revenue'] ?? null;
        if ($revenue === null) {
            if ($weightKg && $weightKg > 0) {
                $revenue = $weightKg * $pricePerUnit;
            } elseif ($totalCount && $totalCount > 0) {
                $revenue = $totalCount * $pricePerUnit;
            } else {
                $revenue = 0;
            }
        }

        DB::transaction(function () use ($cycle, $validated, $outputType, $weightKg, $pricePerUnit, $totalCount, $revenue) {
            // 1. Record Output
            BudidayaHarvest::create([
                'cycle_id'          => $cycle->id,
                'output_type'       => $outputType,
                'total_weight_kg'   => $weightKg,
                'total_count'       => $totalCount,
                'unit_label'        => $validated['unit_label'] ?? ($outputType === 'eggs' ? 'butir' : 'kg'),
                'sale_price_per_kg' => $pricePerUnit,
                'total_revenue'     => $revenue,
                'harvest_date'      => $validated['date'],
                'notes'             => $validated['notes'] ?? null,
                'grade_breakdown'   => $validated['grade_breakdown'] ?? null,
            ]);

            // 2. Close Cycle and Reset Pond only if total harvest
            $isTotal = ($validated['harvest_type'] ?? 'total') === 'total';
            if ($isTotal && $outputType !== 'eggs') {
                $cycle->update(['status' => 'panen']);
                if ($cycle->pond) {
                    $cycle->pond->update(['status' => 'kosong']);
                }
            } else {
                $cycle->update(['status' => 'panen_sebagian']);
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Panen / Produksi berhasil dicatat.'
        ]);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $harvest = BudidayaHarvest::findOrFail($id);
        $cycle = $harvest->cycle;

        if ($cycle->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'output_type'       => 'nullable|in:meat_biomass,eggs,milk,live_count,offspring',
            'weight_kg'         => 'nullable|numeric|min:0',
            'total_count'       => 'nullable|integer|min:0',
            'unit_label'        => 'nullable|string|max:50',
            'price_per_kg'      => 'nullable|numeric|min:0',
            'total_revenue'     => 'nullable|numeric|min:0',
            'date'              => 'required|date',
            'notes'             => 'nullable|string',
            'grade_breakdown'   => 'nullable|array',
        ]);

        $weightKg = $validated['weight_kg'] ?? $harvest->total_weight_kg;
        $totalCount = $validated['total_count'] ?? $harvest->total_count;
        $pricePerUnit = $validated['price_per_kg'] ?? $harvest->sale_price_per_kg;

        $revenue = $validated['total_revenue'] ?? ($weightKg ? ($weightKg * $pricePerUnit) : ($totalCount ? ($totalCount * $pricePerUnit) : 0));

        $harvest->update([
            'output_type'       => $validated['output_type'] ?? $harvest->output_type,
            'total_weight_kg'   => $weightKg,
            'total_count'       => $totalCount,
            'unit_label'        => $validated['unit_label'] ?? $harvest->unit_label,
            'sale_price_per_kg' => $pricePerUnit,
            'total_revenue'     => $revenue,
            'harvest_date'      => $validated['date'],
            'notes'             => $validated['notes'] ?? $harvest->notes,
            'grade_breakdown'   => $validated['grade_breakdown'] ?? $harvest->grade_breakdown,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data panen / produksi berhasil diperbarui'
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $harvest = BudidayaHarvest::findOrFail($id);
        $cycle = $harvest->cycle;

        if ($cycle->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $harvest->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data panen berhasil dihapus'
        ]);
    }
}
