<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailProduct;
use App\Models\RetailStockMovement;
use Illuminate\Http\Request;

class RetailStockController extends Controller
{
    public function index(Request $request)
    {
        $query = RetailProduct::with(['category', 'supplier']);

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock', '<=', 'stock_min');
        }

        return response()->json($query->orderBy('stock', 'asc')->get());
    }

    public function movements(Request $request)
    {
        $query = RetailStockMovement::with(['product', 'user'])->latest('created_at');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('startDate') && $request->filled('endDate')) {
            $query->whereBetween('created_at', [$request->startDate . ' 00:00:00', $request->endDate . ' 23:59:59']);
        }

        return response()->json($query->paginate(30));
    }
}
