<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaExpense;
use App\Models\BudidayaIncome;
use App\Models\BudidayaStaff;
use App\Models\BudidayaRole;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $totalPonds  = BudidayaPond::count();
        $activePonds = BudidayaPond::where('status', 'aktif')->count();

        $activeCycles = BudidayaCycle::whereNotIn('status', ['panen'])
            ->with(['pond', 'species', 'feedings'])
            ->get();

        $activeCyclesCount = $activeCycles->count();

        // Calculate critical count (e.g. FCR > 1.6)
        $criticalPondsCount = 0;
        foreach ($activeCycles as $cycle) {
            $totalFeed = $cycle->feedings->sum('amount_kg');
            $seedCount = (int) ($cycle->seed_count ?? 0);
            $biomass = ($seedCount * 300) / 1000;
            $fcr = ($biomass > 0 && $totalFeed > 0) ? ($totalFeed / $biomass) : 1.0;
            if ($fcr > 1.6) {
                $criticalPondsCount++;
            }
        }

        // Financials (Panen + Pemasukan Kas Lainnya)
        $harvestRevenue = (float) BudidayaHarvest::sum('total_revenue');
        $otherIncome = 0;
        try {
            $otherIncome = (float) BudidayaIncome::sum('amount');
        } catch (\Throwable $e) {}
        $totalRevenue = $harvestRevenue + $otherIncome;

        $totalExpenses = 0;
        try {
            $totalExpenses = (float) BudidayaExpense::sum('amount');
        } catch (\Throwable $e) {}
        $netProfit = $totalRevenue - $totalExpenses;

        // Next or Recent Feeding time
        $lastFeeding = null;
        try {
            $lastFeeding = BudidayaFeeding::latest('created_at')->first();
        } catch (\Throwable $e) {}
        $nextFeedTime = $lastFeeding ? Carbon::parse($lastFeeding->created_at)->addHours(4)->format('H:i') : '16:00';

        // 6-Month dynamic trend
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $monthName = $monthDate->translatedFormat('M');
            $start = $monthDate->copy()->startOfMonth();
            $end = $monthDate->copy()->endOfMonth();

            $rev = 0;
            $weight = 0;
            try {
                $rev = (float) BudidayaHarvest::whereBetween('harvest_date', [$start, $end])->sum('total_revenue');
                $weight = (float) BudidayaHarvest::whereBetween('harvest_date', [$start, $end])->sum('total_weight_kg');
            } catch (\Throwable $e) {}

            $monthlyTrend[] = [
                'label' => $monthName,
                'revenue' => $rev,
                'weight_kg' => $weight,
            ];
        }

        // 6-Week dynamic trend (Weekly data)
        $weeklyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $weekStart = Carbon::now()->subWeeks($i)->startOfWeek();
            $weekEnd = Carbon::now()->subWeeks($i)->endOfWeek();

            $rev = 0;
            $weight = 0;
            try {
                $rev = (float) BudidayaHarvest::whereBetween('harvest_date', [$weekStart, $weekEnd])->sum('total_revenue');
                $weight = (float) BudidayaHarvest::whereBetween('harvest_date', [$weekStart, $weekEnd])->sum('total_weight_kg');
            } catch (\Throwable $e) {}

            $weeklyTrend[] = [
                'label' => 'Mgg ' . (6 - $i),
                'revenue' => $rev,
                'weight_kg' => $weight,
            ];
        }

        // Featured Ponds (Real database ponds)
        $featuredPonds = [];
        try {
            $featuredPonds = BudidayaPond::with(['activeCycle.species'])
                ->orderBy('name')
                ->take(8)
                ->get()
                ->map(function ($pond) {
                    $cycle = $pond->activeCycle;
                    $days = $cycle && $cycle->seed_date ? Carbon::parse($cycle->seed_date)->diffInDays(Carbon::now()) : 0;
                    $seedCount = $cycle ? $cycle->seed_count : 0;
                    $species = $cycle && $cycle->species ? $cycle->species->name : ($cycle->seed_type ?? 'Populasi');
                    
                    return [
                        'id' => $pond->id,
                        'name' => $pond->name,
                        'code' => $pond->code,
                        'type' => $pond->type,
                        'status' => $pond->status,
                        'has_active_cycle' => !empty($cycle),
                        'cycle_id' => $cycle ? $cycle->id : null,
                        'species' => $species,
                        'seed_count' => $seedCount,
                        'doc_days' => $days,
                        'capacity' => $pond->capacity_m3 ?: ($pond->area_m2 ?: 0),
                        'health_status' => $pond->status === 'aktif' ? 'AKTIF' : ($pond->status === 'istirahat' ? 'ISTIRAHAT' : 'KOSONG')
                    ];
                });
        } catch (\Throwable $e) {}

        // Real Recent Feedings
        $recentFeedings = [];
        try {
            $recentFeedings = BudidayaFeeding::with(['cycle.pond'])
                ->latest('created_at')
                ->take(3)
                ->get()
                ->map(function ($f) {
                    return [
                        'id' => 'feed_' . $f->id,
                        'type' => 'feeding',
                        'title' => 'Pemberian Pakan: ' . ($f->cycle->pond->name ?? 'Kandang/Kolam'),
                        'desc' => number_format($f->amount_kg ?? $f->amount ?? 0, 1) . ' kg',
                        'time' => Carbon::parse($f->created_at)->diffForHumans(),
                    ];
                });
        } catch (\Throwable $e) {}

        return response()->json([
            'data' => [
                'total_ponds'       => $totalPonds,
                'active_ponds'      => $activePonds,
                'active_cycles'     => $activeCyclesCount,
                'critical_count'    => $criticalPondsCount,
                'total_revenue'     => $totalRevenue,
                'total_expenses'    => $totalExpenses,
                'net_profit'        => $netProfit,
                'next_feed_time'    => $nextFeedTime,
                'charts'            => [
                    '1B' => $weeklyTrend,
                    '3B' => array_slice($monthlyTrend, -3),
                    '6B' => $monthlyTrend,
                ],
                'featured_ponds'    => $featuredPonds,
                'recent_alerts'     => $recentFeedings,
            ],
        ]);
    }

    // ── Pond reports: FCR per active cycle ───────────────────────────────────
    public function pondReport(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $ponds = BudidayaPond::where('tenant_id', $tenantId)->get();

        $cycles = BudidayaCycle::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['panen'])
            ->with(['pond', 'feedings'])
            ->get()
            ->map(function ($cycle) {
                $totalFeed = $cycle->feedings->sum('amount_kg');
                // Estimate biomass from seed count and a default avg weight
                $seedCount = (int) ($cycle->seed_count ?? 0);
                $avgWeightGram = 300; // default estimate
                $biomass = ($seedCount * $avgWeightGram) / 1000;
                $fcr = ($biomass > 0 && $totalFeed > 0) ? round($totalFeed / $biomass, 2) : null;

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
                $biomass   = (float) ($harvest->total_weight_kg ?? 0);
                $fcr       = ($biomass > 0 && $totalFeed > 0) ? round($totalFeed / $biomass, 2) : null;

                $feedCost  = $totalFeed * 12000;
                $totalCost = $feedCost;
                $revenue   = (float) ($harvest->total_revenue ?? 0);
                $profit    = $revenue - $totalCost;

                $seedCount     = (int) ($cycle->seed_count ?? 0);
                $avgWeight     = 300; // default gram
                $harvestedFish = $biomass > 0 ? ($biomass * 1000) / $avgWeight : 0;
                $survivalRate  = $seedCount > 0 ? round(($harvestedFish / $seedCount) * 100, 1) : null;

                return [
                    'id'            => $harvest->id,
                    'pond_name'     => $pond->name ?? '-',
                    'cycle_id'      => $cycle->id,
                    'fish_type'     => $cycle->seed_type ?? '-',
                    'harvest_date'  => $harvest->harvest_date,
                    'weight_kg'     => $biomass,
                    'price_per_kg'  => (float) ($harvest->sale_price_per_kg ?? 0),
                    'total_revenue' => $revenue,
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
