<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/stats
     * Super admin stats
     */
    public function stats()
    {
        $totalUsers         = User::where('role', 'customer')->count();
        $totalAdmins        = User::where('role', 'admin')->count();
        $totalTenants       = Tenant::count();
        $totalCategories    = BusinessCategory::where('active', true)->count();
        $activeSubs         = Tenant::where('subscription_plan', '!=', 'free')->count();
        $newUsersThisWeek   = User::where('created_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'total_users'             => $totalUsers,
                'total_admins'            => $totalAdmins,
                'total_tenants'           => $totalTenants,
                'total_categories'        => $totalCategories,
                'active_subscriptions'    => $activeSubs,
                'revenue_this_month'      => 48500000, // placeholder
                'new_users_this_week'     => $newUsersThisWeek,
            ],
        ]);
    }

    /**
     * GET /api/dashboard/categories
     * Distribution of tenants per category
     */
    public function categories()
    {
        $categories = BusinessCategory::withCount('tenants')
            ->where('active', true)
            ->get()
            ->map(fn ($cat) => [
                'name'  => $cat->name,
                'value' => $cat->tenants_count,
                'color' => $cat->color ?? '#3b82f6',
                'icon'  => $cat->icon ?? '🏢',
            ]);

        return response()->json(['success' => true, 'data' => $categories]);
    }

    /**
     * GET /api/dashboard/recent-users
     */
    public function recentUsers()
    {
        $users = User::with('businessCategory')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($u) => [
                'id'       => $u->id,
                'name'     => $u->name,
                'email'    => $u->email,
                'role'     => $u->role,
                'status'   => $u->status,
                'category' => $u->businessCategory?->name ?? '-',
                'joined'   => $u->created_at->format('Y-m-d'),
            ]);

        return response()->json(['success' => true, 'data' => $users]);
    }
}
