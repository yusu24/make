<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RetailExpense;
use App\Models\RetailProduct;
use App\Models\RetailTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Retail dashboard: sourced from RetailTransaction/RetailExpense (the tables the
        // actual Retail POS writes to), not the generic Transaction pipeline.
        $income = (float) RetailTransaction::where('status', 'paid')->sum('total_amount');
        $expense = (float) RetailExpense::sum('nominal');
        $incomeCount = RetailTransaction::where('status', 'paid')->count();
        $profit = $income - $expense;

        $todayIncome = (float) RetailTransaction::where('status', 'paid')
            ->whereDate('created_at', now()->toDateString())
            ->sum('total_amount');
        $todayTransactions = RetailTransaction::where('status', 'paid')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $activeProducts = RetailProduct::count();
        $activeStaff = User::where('tenant_id', $request->user()->tenant_id)
            ->where('status', 'active')
            ->count();

        $recentTransactions = RetailTransaction::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'invoice_no' => $t->invoice_no,
                'total_amount' => (float) $t->total_amount,
                'status' => $t->status ?? 'paid',
                'cashier_name' => $t->user?->name,
                'created_at' => $t->created_at,
            ]);

        $lowStock = RetailProduct::with('category')
            ->whereColumn('stock', '<=', 'stock_min')
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'stock' => (float) $p->stock,
            ]);

        $salesByDay = RetailTransaction::where('status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as income')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');

        $expensesByDay = RetailExpense::where('tanggal', '>=', now()->subDays(30)->toDateString())
            ->selectRaw('tanggal as date, SUM(nominal) as expense')
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->get()
            ->keyBy('date');

        $dates = $salesByDay->keys()->merge($expensesByDay->keys())->unique()->sort()->values();
        $stats = $dates->map(fn ($date) => [
            'date' => $date,
            'income' => (float) ($salesByDay[$date]->income ?? 0),
            'expense' => (float) ($expensesByDay[$date]->expense ?? 0),
        ]);

        return response()->json([
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'profit' => $profit,
                'income_count' => $incomeCount,
                'today_income' => $todayIncome,
                'today_transactions' => $todayTransactions,
                'active_products' => $activeProducts,
                'active_staff' => $activeStaff,
            ],
            'recent_transactions' => $recentTransactions,
            'low_stock' => $lowStock,
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
        
        // Calculate actual paid revenue for the current month
        $revenue = (float) \App\Models\TenantInvoice::where('status', 'paid')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');
        
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

        // 2. Fetch real monthly data (last 6 months) from invoices
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = $date->format('M'); // e.g. Jan, Feb
            
            // Total users registered up to the end of this month
            $usersCount = \App\Models\User::where('created_at', '<=', $date->endOfMonth())->count();
            
            // Real Monthly revenue from paid invoices in this month (in millions)
            $monthRevenue = \App\Models\TenantInvoice::where('status', 'paid')
                ->whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->sum('amount') / 1000000;

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
