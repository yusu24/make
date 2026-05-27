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
        // Optimized: Single query for summary
        $summary = Transaction::selectRaw('
                SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense,
                COUNT(CASE WHEN type = "income" THEN 1 END) as income_count
            ')
            ->first();

        $income = (float) ($summary->income ?? 0);
        $expense = (float) ($summary->expense ?? 0);
        $profit = $income - $expense;

        // Last 7 days stats - Optimized with explicit range
        $stats = Transaction::selectRaw('
                date,
                SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense
            ')
            ->where('date', '>=', now()->subDays(30)) // Increased range for better chart
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'profit' => $profit,
                'income_count' => (int) ($summary->income_count ?? 0),
            ],
            'daily_stats' => $stats
        ]);
    }

    public function stats()
    {
        $totalUsers = \App\Models\User::count();
        $totalTenants = \App\Models\Tenant::count();
        
        $basicSubs = \App\Models\Tenant::where('subscription_plan', 'basic')->count();
        $proSubs = \App\Models\Tenant::where('subscription_plan', 'pro')->count();
        $activeSubs = $basicSubs + $proSubs;
        
        $totalCategories = \App\Models\BusinessCategory::count();
        
        // Calculate dynamic monthly revenue based on subscription tiers
        $revenue = ($basicSubs * 149000) + ($proSubs * 299000);
        
        // Real count of new users registered in the last 7 days
        $newUsersThisWeek = \App\Models\User::where('created_at', '>=', now()->subDays(7))->count();

        // 1. Fetch recent 5 users
        $recentUsers = \App\Models\User::with('businessCategory')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'category' => $u->businessCategory?->name ?? '—',
                    'role' => $u->role,
                    'status' => $u->status,
                    'joined' => $u->created_at?->toDateString(),
                ];
            });

        // 2. Fetch monthly data (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = $date->format('M'); // e.g. Jan, Feb
            
            // Total users registered up to the end of this month
            $usersCount = \App\Models\User::where('created_at', '<=', $date->endOfMonth())->count();
            
            // Calculate basic & pro tenants created up to the end of this month
            $basicCount = \App\Models\Tenant::where('created_at', '<=', $date->endOfMonth())
                ->where('subscription_plan', 'basic')
                ->count();
            $proCount = \App\Models\Tenant::where('created_at', '<=', $date->endOfMonth())
                ->where('subscription_plan', 'pro')
                ->count();
            
            // Monthly revenue in millions (projections)
            $monthRevenue = (($basicCount * 149000) + ($proCount * 299000)) / 1000000;

            $monthlyData[] = [
                'month' => $monthLabel,
                'users' => $usersCount,
                'revenue' => (float) $monthRevenue,
            ];
        }

        return response()->json(['data' => [
            'total_users' => $totalUsers,
            'total_tenants' => $totalTenants,
            'total_categories' => $totalCategories,
            'active_subscriptions' => $activeSubs,
            'revenue_this_month' => $revenue,
            'new_users_this_week' => $newUsersThisWeek,
            'recent_users' => $recentUsers,
            'monthly_data' => $monthlyData,
        ]]);
    }
}
