<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MonthlyRevenue;
use App\Models\PlanDistribution;
use App\Models\CategoryDistribution;
use App\Models\TopTenant;

class AdminAnalyticsController extends Controller
{
    public function stats()
    {
        // For general stats, you might want to fetch actual counts from other tables 
        // like User and Tenant, but for now we return static or basic queries.
        $total_tenants = \App\Models\Tenant::count();
        $total_users = \App\Models\User::count();
        $active_subscriptions = \App\Models\Tenant::where('status', 'active')->count() ?? 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_tenants' => $total_tenants,
                'active_subscriptions' => $active_subscriptions,
                'total_users' => $total_users,
            ]
        ]);
    }

    public function monthlyRevenue()
    {
        $records = MonthlyRevenue::orderBy('year')->orderBy('month')->get();
        $months = [1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'];
        
        $data = $records->map(function($record) use ($months) {
            return [
                'year' => $record->year,
                'month' => $months[$record->month] ?? $record->month,
                'revenue' => $record->amount,
                // Optional: we can join with a tenants table or add a tenants count column if needed
                'tenants' => 0 // dummy for now unless added to DB
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function planDistribution()
    {
        $records = PlanDistribution::all();
        $colors = ['Free' => '#6b7280', 'Basic' => '#3b82f6', 'Pro' => '#8b5cf6'];
        
        $data = $records->map(function($record) use ($colors) {
            return [
                'label' => $record->plan_name,
                'value' => $record->tenant_count,
                'color' => $colors[$record->plan_name] ?? '#ccc'
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function categoryDistribution()
    {
        $records = CategoryDistribution::all();
        $colors = ['Retail' => '#10b981', 'F&B' => '#f59e0b', 'Jasa' => '#3b82f6'];
        
        $data = $records->map(function($record) use ($colors) {
            return [
                'label' => $record->category_name,
                'value' => $record->count,
                'color' => $colors[$record->category_name] ?? '#ccc'
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function topTenants()
    {
        $data = TopTenant::orderByDesc('revenue')->get();
        return response()->json(['success' => true, 'data' => $data]);
    }
}
