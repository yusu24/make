<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class KitchenQueueController extends Controller
{
    private const ACTIVE_STATUSES = ['pending', 'waiting', 'processing', 'cooking', 'ready'];

    public function index(Request $request)
    {
        $orders = Order::with('items')
            ->where('tenant_id', $request->user()->tenant_id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($orders);
    }
}
