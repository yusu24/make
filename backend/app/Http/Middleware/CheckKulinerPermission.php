<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckKulinerPermission
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

        $permissions = $user->kulinerRole?->permissions ?? [];

        // Infer action from HTTP method
        $method = $request->method();
        $action = match($method) {
            'GET' => 'view',
            'POST' => 'create',
            'PUT', 'PATCH' => 'edit',
            'DELETE' => 'delete',
            default => 'view'
        };

        $granularPermission = "{$module}.{$action}";
        $wildcardPermission = "{$module}.*";

        // Allow if they have the specific granular permission, the wildcard for the module, or the whole module (backward compatibility)
        if (!in_array($granularPermission, $permissions) && !in_array($wildcardPermission, $permissions) && !in_array($module, $permissions)) {
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak: role Anda tidak memiliki izin '{$action}' untuk modul '{$module}'.",
            ], 403);
        }

        return $next($request);
    }
}
