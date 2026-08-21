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

    public function stats(Request $request)
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

        // 2. Chart data for the two trend charts, bucketed to match whichever
        // period the dashboard's filter dropdown is set to.
        $period = $request->query('period', 'year');
        $monthlyData = $this->buildChartData(
            $period,
            $request->query('start_date'),
            $request->query('end_date')
        );

        // Calculate MRR (Monthly Recurring Revenue)
        // Assume Basic = 50000, Pro = 150000 if not using SubscriptionPlan dynamic values for now
        $mrr = ($basicSubs * 50000) + ($proSubs * 150000);

        // Calculate basic churn rate (inactive / total tenants)
        $inactiveTenants = \App\Models\Tenant::where('status', 'inactive')->count();
        $churnRate = $totalTenants > 0 ? round(($inactiveTenants / $totalTenants) * 100, 1) : 0;

        return response()->json(['data' => [
            'total_users' => $totalUsers,
            'total_tenants' => $totalTenants,
            'total_categories' => $totalCategories,
            'active_subscriptions' => $activeSubs,
            'revenue_this_month' => $revenue,
            'new_users_this_week' => $newUsersThisWeek,
            'mrr' => $mrr,
            'churn_rate' => $churnRate,
            'recent_users' => $recentUsers,
            'monthly_data' => $monthlyData,
        ]]);
    }

    /**
     * Resolves the dashboard chart filter (today/week/month/year/custom) into
     * a [start, end, bucket unit] triple, then walks that range bucket by
     * bucket. "users" is a cumulative count as of each bucket's end (a growth
     * curve), "revenue" is the sum of paid invoices within that bucket alone.
     */
    private function buildChartData(string $period, ?string $customStart, ?string $customEnd): array
    {
        $now = now();

        switch ($period) {
            case 'today':
                $start = $now->copy()->startOfDay();
                $end = $now->copy()->endOfDay();
                $unit = 'hour';
                break;
            case 'week':
                $start = $now->copy()->startOfWeek();
                $end = $now->copy()->endOfWeek();
                $unit = 'day';
                break;
            case 'month':
                $start = $now->copy()->startOfMonth();
                $end = $now->copy()->endOfMonth();
                $unit = 'day';
                break;
            case 'custom':
                $start = $customStart ? \Carbon\Carbon::parse($customStart)->startOfDay() : $now->copy()->subDays(6)->startOfDay();
                $end = $customEnd ? \Carbon\Carbon::parse($customEnd)->endOfDay() : $now->copy()->endOfDay();
                if ($end->lt($start)) {
                    [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
                }
                $spanDays = $start->diffInDays($end);
                $unit = $spanDays <= 1 ? 'hour' : ($spanDays <= 62 ? 'day' : 'month');
                break;
            case 'year':
            default:
                $start = $now->copy()->startOfYear();
                $end = $now->copy()->endOfYear();
                $unit = 'month';
                break;
        }

        // Never chart into the future — clip the walk at "now".
        if ($end->gt($now)) {
            $end = $now->copy();
        }

        $points = [];
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            if ($unit === 'hour') {
                $bucketStart = $cursor->copy()->startOfHour();
                $bucketEnd = $cursor->copy()->endOfHour();
                $label = $cursor->format('H:00');
                $next = $cursor->copy()->addHour();
            } elseif ($unit === 'day') {
                $bucketStart = $cursor->copy()->startOfDay();
                $bucketEnd = $cursor->copy()->endOfDay();
                $label = $cursor->format('d M');
                $next = $cursor->copy()->addDay();
            } else { // month
                $bucketStart = $cursor->copy()->startOfMonth();
                $bucketEnd = $cursor->copy()->endOfMonth();
                $label = $cursor->format('M');
                $next = $cursor->copy()->addMonth();
            }

            $usersCount = \App\Models\User::where('created_at', '<=', $bucketEnd)->count();

            // created_at has real time-of-day precision, unlike the plain
            // `date` column — needed for hour buckets ("today") to actually
            // differ from each other instead of all showing the day's total.
            $bucketRevenue = \App\Models\TenantInvoice::where('status', 'paid')
                ->whereBetween('created_at', [$bucketStart, $bucketEnd])
                ->sum('amount') / 1000000;

            $points[] = [
                'month' => $label,
                'users' => $usersCount,
                'revenue' => (float) $bucketRevenue,
            ];

            $cursor = $next;
        }

        return $points;
    }
}
