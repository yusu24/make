<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailTransaction;
use App\Models\RetailProduct;
use App\Models\RetailTransactionItem;
use App\Models\RetailCustomer;
use Illuminate\Support\Facades\DB;

class RetailReportController extends Controller
{
    public function getReports(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $transactions = RetailTransaction::where('tenant_id', $tenantId)
            ->with(['items', 'customer'])
            ->latest()
            ->get();

        $totalSales = $transactions->sum('total_amount');
        $totalTx    = $transactions->count();

        // 1. Daily Sales Trend (Last 7 Days)
        $dailySales = RetailTransaction::where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 2. Best Selling Products
        $topProducts = RetailTransactionItem::select('product_id', DB::raw('SUM(qty) as total_qty'))
            ->whereHas('transaction', function($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->with('product')
            ->take(5)
            ->get();

        // 3. Top Spenders (Customers)
        $topCustomers = RetailTransaction::where('tenant_id', $tenantId)
            ->whereNotNull('customer_id')
            ->select('customer_id', DB::raw('SUM(total_amount) as total_spent'), DB::raw('COUNT(*) as visit_count'))
            ->groupBy('customer_id')
            ->orderByDesc('total_spent')
            ->with('customer')
            ->take(5)
            ->get();

        // 4. Critical Stock (based on stock_min)
        $lowStock = RetailProduct::where('tenant_id', $tenantId)
            ->whereColumn('stock', '<=', 'stock_min')
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json([
            'total_sales'        => $totalSales,
            'total_transactions' => $totalTx,
            'daily_sales'        => $dailySales,
            'top_products'       => $topProducts,
            'top_customers'      => $topCustomers,
            'low_stock'          => $lowStock,
            'transactions'       => $transactions->take(50),
        ]);
    }
}
