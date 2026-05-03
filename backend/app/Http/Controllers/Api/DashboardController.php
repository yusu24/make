<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $income = Transaction::where('type', 'income')->sum('amount');
        $expense = Transaction::where('type', 'expense')->sum('amount');
        $profit = $income - $expense;

        // Last 7 days stats
        $stats = Transaction::select(
                DB::raw('date'),
                DB::raw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income'),
                DB::raw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get();

        return response()->json([
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'profit' => $profit,
            ],
            'daily_stats' => $stats
        ]);
    }

    public function stats()
    {
        $totalUsers = \App\Models\User::count();
        $totalTenants = \App\Models\Tenant::count();
        $activeSubs = \App\Models\Tenant::where('subscription_plan', '!=', 'free')->count();
        $totalCategories = \App\Models\BusinessCategory::count();
        
        return response()->json(['data' => [
            'total_users' => $totalUsers,
            'total_tenants' => $totalTenants,
            'total_categories' => $totalCategories,
            'active_subscriptions' => $activeSubs,
            'revenue_this_month' => 48500000, // Dummy
            'new_users_this_week' => 12, // Dummy
        ]]);
    }
}
