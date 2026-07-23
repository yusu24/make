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
    public function impersonateUser(Request $request, $id)
    {
        $requester = $request->user();
        $targetUser = User::with(['businessCategory', 'tenant', 'retailRole', 'kulinerRole'])->findOrFail($id);

        // Authorization check
        $canImpersonate = false;
        
        // 1. Super Admin/Admin can impersonate anyone
        if (in_array($requester->role, ['super_admin', 'admin'])) {
            $canImpersonate = true;
        } 
        // 2. Tenant Owner can impersonate their staff
        else if ($requester->tenant_id === $targetUser->tenant_id && $targetUser->role !== 'super_admin' && $targetUser->role !== 'admin') {
            $canImpersonate = true;
        }

        if (!$canImpersonate) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Create a short-lived token (1 hour) for the target user
        $token = $targetUser->createToken('impersonate', ['*'], now()->addHour())->plainTextToken;

        // Use tenant from target user if available
        $tenant = $targetUser->tenant;
        $plan = $tenant?->subscription_plan ?? 'free';
        $businessCategory = $targetUser->businessCategory?->name ?? $tenant?->businessCategory?->name;

        $userData = [
            'id'                  => $targetUser->id,
            'name'                => $targetUser->name,
            'email'               => $targetUser->email,
            'role'                => $targetUser->role,
            'tenant_id'           => $targetUser->tenant_id,
            'tenant_name'         => $tenant?->business_name ?? $tenant?->name,
            'status'              => $targetUser->status,
            'phone'               => $targetUser->phone,
            'business_category'   => $businessCategory,
            'business_category_id'=> $targetUser->business_category_id,
            'subscription_plan'   => $plan,
            'subscription_status' => 'active',
            'subscription_days_left' => 999,
            'permissions'         => ($targetUser->role === 'customer' || $targetUser->role === 'super_admin') 
                                    ? 'all' 
                                    : ($targetUser->retailRole ? $targetUser->retailRole->permissions : ($targetUser->kulinerRole ? $targetUser->kulinerRole->permissions : [])),
            'is_impersonating'    => true,
            'active_modules'      => $tenant ? $tenant->modules()->where('is_active', true)->pluck('name')->toArray() : [],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Impersonate berhasil',
            'data' => [
                'token'    => $token,
                'user'     => $userData,
                'redirect' => $this->resolveRedirect($businessCategory, $targetUser->role),
            ],
        ]);
    }

    public function resolveRedirect(?string $category, ?string $role = null): string
    {
        if ($role === 'super_admin' || $role === 'admin') return '/dashboard';

        $cat = trim((string) $category);
        if (strcasecmp($cat, 'Budidaya Ikan') === 0)     return '/budidaya/dashboard';
        if (strcasecmp($cat, 'Budidaya Tanaman') === 0)  return '/budidaya/dashboard';
        if (strcasecmp($cat, 'Toko Retail') === 0)       return '/retail/dashboard';
        if (strcasecmp($cat, 'Kuliner') === 0)           return '/kuliner/admin/categories';

        return '/coming-soon';
    }
}
