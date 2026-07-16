<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRetailPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        // Tenant owner account and platform super admin always have full access.
        if (!$user || in_array($user->role, ['customer', 'super_admin'])) {
            return $next($request);
        }

        $permissions = $user->retailRole?->permissions ?? [];

        if (!in_array($module, $permissions)) {
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak: role Anda tidak memiliki izin '{$module}'.",
            ], 403);
        }

        return $next($request);
    }
}
