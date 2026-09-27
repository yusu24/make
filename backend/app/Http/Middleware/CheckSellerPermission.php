<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSellerPermission
{
    /**
     * Handle an incoming request for Seller / Omnichannel modules.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        // Platform super admins, admins, and tenant owner accounts always have full access.
        if (!$user || in_array($user->role, ['customer', 'super_admin', 'admin', 'tenant', 'owner'])) {
            return $next($request);
        }

        // Get permissions from retailRole (which stores both retail and omnichannel permissions)
        $userPermissions = $user->retailRole?->permissions ?? [];

        // Check if user has specific permission, module wildcard, or full seller access
        $hasPermission = in_array($permission, $userPermissions)
            || in_array('seller_*', $userPermissions)
            || in_array('all', $userPermissions)
            // Backward-compat aliases without prefix
            || in_array(str_replace('seller_', '', $permission), $userPermissions);

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak: role Anda tidak memiliki izin '{$permission}'.",
            ], 403);
        }

        return $next($request);
    }
}
