<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya Super Admin yang dapat mengakses endpoint ini.',
            ], 403);
        }

        return $next($request);
    }
}
