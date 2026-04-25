<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;

class ReportController extends Controller
{
    public function dashboardStats(Request $request) 
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        
        $totalPonds = BudidayaPond::where('tenant_id', $tenantId)->count();
        $activePonds = BudidayaPond::where('tenant_id', $tenantId)->where('status', 'aktif')->count();
        
        $activeCycles = BudidayaCycle::where('tenant_id', $tenantId)->whereNotIn('status', ['panen'])->count();
        
        // Sum total revenue from harvest
        $totalRevenue = BudidayaHarvest::whereHas('cycle', function($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->sum('total_revenue');

        // Get monthly revenue trends (last 6 months)
        $revenueTrend = BudidayaHarvest::whereHas('cycle', function($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })
        ->selectRaw('DATE_FORMAT(harvest_date, "%M") as month, SUM(total_revenue) as revenue')
        ->groupBy('month')
        ->orderByRaw('MIN(harvest_date) ASC')
        ->limit(6)
        ->get();

        // Get total feed costs (proxy for expenses)
        $totalFeedCost = \App\Models\BudidayaFeeding::whereHas('cycle', function($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->sum('amount_kg') * 12000; // Simplified estimation for now

        return response()->json([
            'data' => [
                'total_ponds' => $totalPonds,
                'active_ponds' => $activePonds,
                'active_cycles' => $activeCycles,
                'total_revenue' => (float)$totalRevenue,
                'revenue_trend' => $revenueTrend,
                'total_expenses' => (float)$totalFeedCost,
                'net_profit' => (float)($totalRevenue - $totalFeedCost)
            ]
        ]);
    }
}
