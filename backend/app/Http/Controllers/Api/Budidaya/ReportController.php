<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaStaff;
use App\Models\BudidayaRole;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $totalPonds  = BudidayaPond::where('tenant_id', $tenantId)->count();
        $activePonds = BudidayaPond::where('tenant_id', $tenantId)->where('status', 'aktif')->count();

        $activeCycles = BudidayaCycle::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['panen'])
            ->count();

        $totalRevenue = BudidayaHarvest::whereHas('cycle', fn($q) => $q->where('tenant_id', $tenantId))
            ->sum('total_revenue');

        $revenueTrend = BudidayaHarvest::whereHas('cycle', fn($q) => $q->where('tenant_id', $tenantId))
            ->selectRaw('DATE_FORMAT(harvest_date, "%M") as month, SUM(total_revenue) as revenue')
            ->groupBy('month')
            ->orderByRaw('MIN(harvest_date) ASC')
            ->limit(6)
            ->get();

        $totalFeedCost = BudidayaFeeding::whereHas('cycle', fn($q) => $q->where('tenant_id', $tenantId))
            ->sum('amount_kg') * 12000;

        return response()->json([
            'data' => [
                'total_ponds'    => $totalPonds,
                'active_ponds'   => $activePonds,
                'active_cycles'  => $activeCycles,
                'total_revenue'  => (float) $totalRevenue,
                'revenue_trend'  => $revenueTrend,
                'total_expenses' => (float) $totalFeedCost,
                'net_profit'     => (float) ($totalRevenue - $totalFeedCost),
            ],
        ]);
    }

    // ── Pond reports: FCR per active cycle ───────────────────────────────────
    public function pondReport(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $ponds = BudidayaPond::where('tenant_id', $tenantId)
            ->with(['latestSensor'])
            ->get();

        $cycles = BudidayaCycle::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['panen'])
            ->with(['pond', 'feedings', 'samplings'])
            ->get()
            ->map(function ($cycle) {
                $totalFeed      = $cycle->feedings->sum('amount_kg');
                $latestSampling = $cycle->samplings->sortByDesc('date')->first();
                $biomass        = $latestSampling
                    ? ($latestSampling->avg_weight_gram / 1000) * $latestSampling->estimated_count
                    : 0;
                $fcr = ($biomass > 0) ? round($totalFeed / $biomass, 2) : null;

                return [
                    'cycle_id'   => $cycle->id,
                    'pond_name'  => $cycle->pond->name ?? '-',
                    'total_feed' => $totalFeed,
                    'biomass_kg' => round($biomass, 2),
                    'fcr'        => $fcr,
                    'status'     => $fcr === null ? 'kosong' : ($fcr <= 1.3 ? 'sehat' : ($fcr <= 1.6 ? 'moderat' : 'kritis')),
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'ponds' => $ponds,
                'fcr'   => $cycles,
            ],
        ]);
    }

    // ── Harvest summary: all completed cycles ────────────────────────────────
    public function harvestSummary(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $harvests = BudidayaHarvest::whereHas('cycle', fn($q) => $q->where('tenant_id', $tenantId))
            ->with(['cycle.pond', 'cycle.feedings'])
            ->orderByDesc('harvest_date')
            ->get()
            ->map(function ($harvest) {
                $cycle     = $harvest->cycle;
                $pond      = $cycle->pond;
                $totalFeed = $cycle->feedings->sum('amount_kg');
                $biomass   = $harvest->total_weight_kg;
                $fcr       = ($biomass > 0 && $totalFeed > 0) ? round($totalFeed / $biomass, 2) : null;

                $seedCost  = (float) ($cycle->seed_cost ?? 0);
                $feedCost  = $totalFeed * 12000;
                $totalCost = $seedCost + $feedCost;
                $profit    = $harvest->total_revenue - $totalCost;

                $initialPop    = (int) ($cycle->initial_population ?? 0);
                $avgWeight     = max((float) ($cycle->avg_weight_gram ?? 300), 1);
                $harvestedFish = ($biomass * 1000) / $avgWeight;
                $survivalRate  = $initialPop > 0 ? round(($harvestedFish / $initialPop) * 100, 1) : null;

                return [
                    'id'            => $harvest->id,
                    'pond_name'     => $pond->name ?? '-',
                    'cycle_id'      => $cycle->id,
                    'fish_type'     => $cycle->fish_type ?? '-',
                    'harvest_date'  => $harvest->harvest_date,
                    'weight_kg'     => (float) $harvest->total_weight_kg,
                    'price_per_kg'  => (float) $harvest->sale_price_per_kg,
                    'total_revenue' => (float) $harvest->total_revenue,
                    'total_cost'    => (float) $totalCost,
                    'net_profit'    => (float) $profit,
                    'total_feed_kg' => (float) $totalFeed,
                    'fcr'           => $fcr,
                    'survival_rate' => $survivalRate,
                ];
            });

        $totalRevenue  = $harvests->sum('total_revenue');
        $totalCost     = $harvests->sum('total_cost');
        $totalProfit   = $harvests->sum('net_profit');
        $avgFcr        = $harvests->whereNotNull('fcr')->avg('fcr');
        $totalWeightKg = $harvests->sum('weight_kg');

        return response()->json([
            'data' => [
                'summary' => [
                    'total_revenue'   => (float) $totalRevenue,
                    'total_cost'      => (float) $totalCost,
                    'total_profit'    => (float) $totalProfit,
                    'avg_fcr'         => $avgFcr ? round($avgFcr, 2) : null,
                    'total_weight_kg' => (float) $totalWeightKg,
                    'total_harvests'  => $harvests->count(),
                ],
                'records' => $harvests->values(),
            ],
        ]);
    }

    // ── Staff summary ────────────────────────────────────────────────────────
    public function staffStats(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $total   = BudidayaStaff::where('tenant_id', $tenantId)->count();
        $active  = BudidayaStaff::where('tenant_id', $tenantId)->where('status', 'aktif')->count();

        $managerRole = BudidayaRole::where('tenant_id', $tenantId)->where('slug', 'manajer')->first();
        $managers    = $managerRole
            ? BudidayaStaff::where('tenant_id', $tenantId)->where('budidaya_role_id', $managerRole->id)->count()
            : 0;

        return response()->json([
            'data' => [
                'total'    => $total,
                'active'   => $active,
                'managers' => $managers,
                'security' => 98,
            ],
        ]);
    }
}
