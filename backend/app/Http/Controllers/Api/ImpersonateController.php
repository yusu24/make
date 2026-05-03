<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class ImpersonateController extends Controller
{
    /**
     * POST /api/admin/tenants/{tenant_id}/impersonate
     * Admin SaaS can generate a temporary token for any tenant's owner.
     */
    public function impersonate(Request $request, string $tenantId)
    {
        // Only super_admin or admin can impersonate
        $requester = $request->user();
        if (!in_array($requester->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tenant = Tenant::where('tenant_id', $tenantId)->firstOrFail();
        $targetUser = User::with('businessCategory', 'tenant')
            ->where('id', $tenant->user_id)
            ->first();

        if (!$targetUser) {
            return response()->json(['message' => 'User tenant tidak ditemukan'], 404);
        }

        // Create a short-lived token (1 hour) for the tenant user
        $token = $targetUser->createToken('impersonate', ['*'], now()->addHour())->plainTextToken;

        // Format user data same as login
        $plan = $tenant->subscription_plan ?? 'free';
        $businessCategory = $targetUser->businessCategory?->name ?? $tenant->businessCategory?->name;

        $userData = [
            'id'                  => $targetUser->id,
            'name'                => $targetUser->name,
            'email'               => $targetUser->email,
            'role'                => $targetUser->role,
            'status'              => $targetUser->status,
            'phone'               => $targetUser->phone,
            'business_category'   => $businessCategory,
            'business_category_id'=> $targetUser->business_category_id,
            'subscription_plan'   => $plan,
            'subscription_status' => 'active',
            'subscription_days_left' => 999,
            'permissions'         => 'all',
            'is_impersonating'    => true,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Impersonate berhasil',
            'data' => [
                'token'    => $token,
                'user'     => $userData,
                'redirect' => $this->resolveRedirect($businessCategory),
            ],
        ]);
    }

    private function resolveRedirect(?string $category): string
    {
        $cat = trim($category);
        if (strcasecmp($cat, 'Budidaya Ikan') === 0) return '/budidaya/dashboard';
        if (strcasecmp($cat, 'Toko Retail') === 0)   return '/retail/dashboard';
        if (strcasecmp($cat, 'Kuliner') === 0)       return '/kuliner/admin/categories';
        
        return '/coming-soon';
    }
}
