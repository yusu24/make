<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaPond;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHealth;
use App\Models\BudidayaSampling;
use App\Models\BudidayaHarvest;
use App\Models\BudidayaExpense;
use Illuminate\Support\Facades\DB;

class CycleController extends Controller
{
    // Retrieve all cycles for the current tenant
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $status = $request->query('status'); // Optional filter

        $query = BudidayaCycle::where('tenant_id', $tenantId)->with('pond');
        if ($status) {
            $query->where('status', $status);
        }

        $cycles = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $cycles]);
    }

    // Start a new cycle
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'pond_id' => 'required|exists:budidaya_ponds,id',
            'seed_type' => 'required|string',
            'seed_count' => 'required|integer|min:1',
            'seed_date' => 'required|date',
            'expected_harvest_date' => 'nullable|date'
        ]);

        return DB::transaction(function () use ($request, $tenantId) {
            $pond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($request->pond_id);
            if ($pond->status !== 'kosong') {
                return response()->json(['message' => 'Kolam masih aktif. Kosongkan kolam terlebih dahulu.'], 422);
            }

            $cycle = BudidayaCycle::create([
                'tenant_id' => $tenantId,
                'pond_id' => $request->pond_id,
                'seed_type' => $request->seed_type,
                'seed_count' => $request->seed_count,
                'seed_date' => $request->seed_date,
                'expected_harvest_date' => $request->expected_harvest_date,
                'status' => 'pembibitan'
            ]);

            $pond->update(['status' => 'aktif']);

            return response()->json(['message' => 'Siklus budidaya berhasil dimulai', 'data' => $cycle]);
        });
    }

    // Get a specific cycle with all its related data (Feeds, Health, Samplings)
    public function show(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cycle = BudidayaCycle::where('tenant_id', $tenantId)
            ->with(['pond'])
            ->findOrFail($id);

        // Fetch logs
        $feedings = BudidayaFeeding::where('cycle_id', $cycle->id)
            ->join('budidaya_feed_stocks', 'budidaya_feedings.feed_stock_id', '=', 'budidaya_feed_stocks.id')
            ->select('budidaya_feedings.*', 'budidaya_feed_stocks.name as feed_name')
            ->orderBy('date', 'desc')->get();

        $healthLogs = BudidayaHealth::where('cycle_id', $cycle->id)->orderBy('date', 'desc')->get();
        $samplings = BudidayaSampling::where('cycle_id', $cycle->id)->orderBy('date', 'desc')->get();
        $harvest = BudidayaHarvest::where('cycle_id', $cycle->id)->first();
        $expenses = BudidayaExpense::where('cycle_id', $cycle->id)->orderBy('date', 'desc')->get();

        // Calculate basic stats
        $totalMortality = $healthLogs->sum('mortality_count');
        $survivalRate = max(0, (($cycle->seed_count - $totalMortality) / $cycle->seed_count) * 100);

        return response()->json([
            'data' => [
                'cycle' => $cycle,
                'stats' => [
                    'total_mortality' => $totalMortality,
                    'current_population' => $cycle->seed_count - $totalMortality,
                    'survival_rate' => round($survivalRate, 2),
                    'total_feed_kg' => $feedings->sum('amount_kg'),
                ],
                'feedings' => $feedings,
                'health_logs' => $healthLogs,
                'samplings' => $samplings,
                'harvest' => $harvest,
                'expenses' => $expenses
            ]
        ]);
    }

    // End a cycle (Harvest)
    public function harvest(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'total_weight_kg' => 'required|numeric',
            'sale_price_per_kg' => 'nullable|numeric',
            'harvest_date' => 'required|date'
        ]);

        return DB::transaction(function () use ($request, $tenantId, $id) {
            $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($id);
            if ($cycle->status === 'panen') {
                return response()->json(['message' => 'Siklus ini sudah selesai/dipanen'], 422);
            }

            $revenue = ($request->sale_price_per_kg ?? 0) * $request->total_weight_kg;

            $harvest = BudidayaHarvest::create([
                'cycle_id' => $cycle->id,
                'total_weight_kg' => $request->total_weight_kg,
                'sale_price_per_kg' => $request->sale_price_per_kg,
                'total_revenue' => $revenue,
                'harvest_date' => $request->harvest_date,
                'notes' => $request->notes
            ]);

            $cycle->update(['status' => 'panen']);
            $pond = BudidayaPond::find($cycle->pond_id);
            if ($pond) {
                // Free the pond
                $pond->update(['status' => 'kosong']);
            }

            return response()->json(['message' => 'Siklus berhasil dipanen', 'data' => $harvest]);
        });
    }

    // Log Health/Mortality
    public function logHealth(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'cycle_id' => 'required|exists:budidaya_cycles,id',
            'disease_note' => 'nullable|string',
            'treatment_note' => 'nullable|string',
            'mortality_count' => 'required|integer|min:0',
            'date' => 'required|date'
        ]);

        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($request->cycle_id);

        $log = \App\Models\BudidayaHealth::create([
            'cycle_id' => $cycle->id,
            'disease_note' => $request->disease_note,
            'treatment_note' => $request->treatment_note,
            'mortality_count' => $request->mortality_count,
            'date' => $request->date
        ]);

        return response()->json(['message' => 'Catatan kesehatan & kematian disimpan', 'data' => $log]);
    }

    // Log Sampling / Growth
    public function logSampling(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'cycle_id' => 'required|exists:budidaya_cycles,id',
            'average_weight_gram' => 'required|numeric|min:0.1',
            'estimated_biomass_kg' => 'nullable|numeric|min:0',
            'date' => 'required|date'
        ]);

        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($request->cycle_id);

        $log = BudidayaSampling::create([
            'cycle_id' => $cycle->id,
            'average_weight_gram' => $request->average_weight_gram,
            'estimated_biomass_kg' => $request->estimated_biomass_kg,
            'date' => $request->date
        ]);

        return response()->json(['message' => 'Sampling pertumbuhan dicatat', 'data' => $log]);
    }
}
