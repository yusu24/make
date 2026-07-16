<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant;

class CheckBusinessCategory
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $allowedCategorySlug
     */
    public function handle(Request $request, Closure $next, string $allowedCategorySlug): Response
    {
        $user = $request->user();

        // 1. Super admins can bypass business category checks to administer all modules
        if ($user && $user->role === 'super_admin') {
            return $next($request);
        }

        // 2. Ensure user has an associated tenant
        if (!$user || !$user->tenant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: No tenant context found for this user.'
            ], 403);
        }

        // 3. Fetch the tenant along with its business category
        $tenant = Tenant::where('tenant_id', $user->tenant_id)
            ->with('businessCategory')
            ->first();

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Tenant record not found.'
            ], 403);
        }

        // 4. Validate the business category slug
        $categorySlug = $tenant->businessCategory?->slug;

        if ($categorySlug !== $allowedCategorySlug) {
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak: Fitur ini tidak sesuai dengan kategori bisnis Anda.",
                'business_category_required' => $allowedCategorySlug,
                'business_category_actual' => $categorySlug
            ], 403);
        }

        return $next($request);
    }
}
