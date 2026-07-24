<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExpireSessionOnDateChange
{
    /**
     * Force logout once the calendar date has rolled over since the token
     * was issued — a fresh login is required every day, even if the token
     * itself hasn't hit any rolling expiry window.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && !$token->created_at->isToday()) {
            $token->delete();

            return response()->json([
                'success' => false,
                'message' => 'Sesi Anda sudah berakhir karena pergantian hari. Silakan login kembali.',
            ], 401);
        }

        return $next($request);
    }
}
