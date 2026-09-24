<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            // Check if already authenticated via API Key
            if ($request->attributes->has('tenant_id') && !empty($request->attributes->get('tenant_id'))) {
                return $next($request);
            }
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (empty($user->tenant_id)) {
            return response()->json(['message' => 'Unauthorized: No Tenant ID associated with this user.'], 403);
        }

        // Bind trusted tenant context to request attributes
        $request->attributes->set('tenant_id', $user->tenant_id);
        $request->attributes->set('tenant', $user->tenant);

        return $next($request);
    }
}
