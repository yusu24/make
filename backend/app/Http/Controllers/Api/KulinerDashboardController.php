<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KulinerOrder;
use App\Models\KulinerSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KulinerDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        // For public demo, we use the first tenant we find
        $settings = KulinerSetting::first();
        $tenant_id = $settings ? $settings->tenant_id : 'TN-ADMIN';

        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        $stats = [
            'revenue_today' => KulinerOrder::where('tenant_id', $tenant_id)
                ->where('status', '!=', 'cancelled')
                ->whereDate('created_at', $today)
                ->sum('total_amount'),
            
            'orders_today' => KulinerOrder::where('tenant_id', $tenant_id)
                ->whereDate('created_at', $today)
                ->count(),

            'revenue_month' => KulinerOrder::where('tenant_id', $tenant_id)
                ->where('status', '!=', 'cancelled')
                ->where('created_at', '>=', $thisMonth)
                ->sum('total_amount'),

            'total_orders' => KulinerOrder::where('tenant_id', $tenant_id)->count(),

            'recent_orders' => KulinerOrder::where('tenant_id', $tenant_id)
                ->with('items')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get(),
            
            'sales_chart' => KulinerOrder::where('tenant_id', $tenant_id)
                ->where('status', '!=', 'cancelled')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('date')
                ->get()
        ];

        return response()->json($stats);
    }
}
