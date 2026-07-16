<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailTransaction;
use App\Models\RetailProduct;
use App\Models\RetailTransactionItem;
use App\Models\RetailCustomer;
use App\Models\RetailExpense;
use App\Models\RetailPurchase;
use App\Models\RetailSupplierReturn;
use App\Models\RetailCustomerReturn;
use Illuminate\Support\Facades\DB;

class RetailReportController extends Controller
{
    public function getReports(Request $request) {
        $transactions = RetailTransaction::where('status', 'paid')
            ->with(['items', 'customer'])
            ->latest()
            ->get();

        $totalSales = $transactions->sum('total_amount');
        $totalTx    = $transactions->count();

        // 1. Daily Sales Trend (Last 7 Days)
        $dailySales = RetailTransaction::where('status', 'paid')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 2. Best Selling Products
        $topProducts = RetailTransactionItem::select('product_id', DB::raw('SUM(qty) as total_qty'))
            ->whereHas('transaction', function($q) {
                $q->where('status', 'paid');
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->with('product')
            ->take(5)
            ->get();

        // 3. Top Spenders (Customers)
        $topCustomers = RetailTransaction::where('status', 'paid')
            ->whereNotNull('customer_id')
            ->select('customer_id', DB::raw('SUM(total_amount) as total_spent'), DB::raw('COUNT(*) as visit_count'))
            ->groupBy('customer_id')
            ->orderByDesc('total_spent')
            ->with('customer')
            ->take(5)
            ->get();

        // 4. Critical Stock (based on stock_min)
        $lowStock = RetailProduct::whereColumn('stock', '<=', 'stock_min')
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

    // GET /api/retail/reports/profit-loss?startDate=&endDate=
    public function profitLoss(Request $request)
    {
        $start = $request->query('startDate', now()->startOfMonth()->toDateString());
        $end = $request->query('endDate', now()->toDateString());

        $items = RetailTransactionItem::whereHas('transaction', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"]);
        })->get();

        $revenue = $items->sum('subtotal');
        $cogs = $items->sum(fn ($i) => $i->cost_price * $i->qty);

        $discounts = RetailTransaction::where('status', 'paid')
            ->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"])
            ->sum('discount_amount');
        $tax = RetailTransaction::where('status', 'paid')
            ->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"])
            ->sum('tax_amount');

        $grossProfit = $revenue - $cogs;

        $expensesByCategory = RetailExpense::whereBetween('tanggal', [$start, $end])
            ->selectRaw('kategori, SUM(nominal) as total')
            ->groupBy('kategori')
            ->get();
        $totalExpenses = $expensesByCategory->sum('total');

        $netProfit = $grossProfit - $totalExpenses;

        return response()->json([
            'period' => ['start' => $start, 'end' => $end],
            'revenue' => $revenue,
            'discounts' => $discounts,
            'tax' => $tax,
            'cogs' => $cogs,
            'gross_profit' => $grossProfit,
            'expenses_by_category' => $expensesByCategory,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
        ]);
    }

    // GET /api/retail/reports/purchases?startDate=&endDate=
    public function purchases(Request $request)
    {
        $start = $request->query('startDate', now()->startOfMonth()->toDateString());
        $end = $request->query('endDate', now()->toDateString());

        $purchases = RetailPurchase::with(['supplier', 'items.product'])
            ->whereBetween('purchase_date', [$start, $end])
            ->latest()
            ->get();

        return response()->json([
            'total_spent' => $purchases->sum('total_cost'),
            'total_purchases' => $purchases->count(),
            'purchases' => $purchases,
        ]);
    }

    // GET /api/retail/reports/returns?startDate=&endDate=
    public function returns(Request $request)
    {
        $start = $request->query('startDate', now()->startOfMonth()->toDateString());
        $end = $request->query('endDate', now()->toDateString());

        $supplierReturns = RetailSupplierReturn::with(['supplier', 'items'])
            ->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"])
            ->latest()
            ->get();

        $customerReturns = RetailCustomerReturn::with(['customer', 'items'])
            ->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"])
            ->latest()
            ->get();

        return response()->json([
            'supplier_returns' => [
                'count' => $supplierReturns->count(),
                'total_amount' => $supplierReturns->sum('total_amount'),
                'data' => $supplierReturns,
            ],
            'customer_returns' => [
                'count' => $customerReturns->count(),
                'total_amount' => $customerReturns->sum('total_amount'),
                'data' => $customerReturns,
            ],
        ]);
    }
}
