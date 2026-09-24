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
        
        // If $id is a tenant_id (e.g. starting with TN-), find the tenant's primary user
        if (is_string($id) && str_starts_with($id, 'TN-')) {
            $targetUser = User::with(['businessCategory', 'tenant.businessCategory', 'retailRole', 'kulinerRole', 'jasaRole'])
                ->where('tenant_id', $id)
                ->orderByRaw("FIELD(role, 'owner', 'customer', 'admin', 'jasa_owner', 'jasa_staff') ASC")
                ->first();

            if (!$targetUser) {
                $tenant = Tenant::with('businessCategory')->where('tenant_id', $id)->firstOrFail();
                $targetUser = User::create([
                    'tenant_id'            => $tenant->tenant_id,
                    'name'                 => $tenant->name ?: 'Tenant Owner',
                    'email'                => $tenant->email ?: strtolower($tenant->tenant_id) . '@tenant.local',
                    'password'             => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role'                 => 'owner',
                    'status'               => 'active',
                    'business_category_id' => $tenant->business_category_id,
                ])->load(['businessCategory', 'tenant.businessCategory', 'retailRole', 'kulinerRole', 'jasaRole']);
            }
        } else {
            $targetUser = User::with(['businessCategory', 'tenant.businessCategory', 'retailRole', 'kulinerRole', 'jasaRole'])->findOrFail($id);
        }

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
        $businessCategoryId = $targetUser->business_category_id ?? $tenant?->business_category_id;

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
            'business_category_id'=> $businessCategoryId,
            'subscription_plan'   => $plan,
            'subscription_status' => 'active',
            'subscription_days_left' => 999,
            'permissions'         => ($targetUser->role === 'customer' || $targetUser->role === 'super_admin' || $targetUser->role === 'owner') 
                                    ? 'all' 
                                    : ($targetUser->retailRole ? $targetUser->retailRole->permissions : ($targetUser->kulinerRole ? $targetUser->kulinerRole->permissions : ($targetUser->jasaRole ? $targetUser->jasaRole->permissions : []))),
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
        if ($role === 'jasa_staff' || $role === 'jasa_owner') return '/jasa/dashboard';
        if ($role === 'retail_cashier') return '/retail/pos';

        $cat = strtolower(trim((string) $category));
        if (str_contains($cat, 'budi') || str_contains($cat, 'ternak') || str_contains($cat, 'ikan') || str_contains($cat, 'tani')) {
            return '/budidaya/dashboard';
        }
        if (str_contains($cat, 'retail') || str_contains($cat, 'toko')) {
            return '/retail/dashboard';
        }
        if (str_contains($cat, 'kuliner') || str_contains($cat, 'resto') || str_contains($cat, 'cafe')) {
            return '/kuliner/admin';
        }
        if (str_contains($cat, 'seller') || str_contains($cat, 'omnichannel')) {
            return '/seller/dashboard';
        }
        if (str_contains($cat, 'jasa') || str_contains($cat, 'repair') || str_contains($cat, 'servis') || str_contains($cat, 'bengkel')) {
            return '/jasa/dashboard';
        }

        return '/coming-soon';
    }
}
