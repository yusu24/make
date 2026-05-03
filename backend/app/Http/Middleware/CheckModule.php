<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant;

class CheckModule
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $moduleName
     */
    public function handle(Request $request, Closure $next, string $moduleName): Response
    {
        $user = $request->user();

        if (!$user || !$user->tenant_id) {
            return response()->json(['message' => 'Unauthorized: No Tenant context.'], 403);
        }

        $tenant = Tenant::where('tenant_id', $user->tenant_id)->first();

        if (!$tenant || !$tenant->hasModule($moduleName)) {
            return response()->json([
                'message' => "Akses ditolak: Modul '{$moduleName}' tidak aktif untuk akun Anda.",
                'module_required' => $moduleName
            ], 403);
        }

        return $next($request);
    }
}
