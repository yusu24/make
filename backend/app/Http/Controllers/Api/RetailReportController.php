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
        $start = $request->query('startDate');
        $end = $request->query('endDate');

        $txQuery = RetailTransaction::where('status', 'paid');
        if ($start && $end) {
            $txQuery->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"]);
        }

        $transactions = $txQuery->with(['items', 'customer'])
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
        $topQuery = RetailTransactionItem::select('product_id', DB::raw('SUM(qty) as total_qty'))
            ->whereHas('transaction', function($q) use ($start, $end) {
                $q->where('status', 'paid');
                if ($start && $end) {
                    $q->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"]);
                }
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->with('product');
        
        $topProducts = $topQuery->take(5)->get();

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

        $grossProfit = $revenue - $discounts - $cogs;

        $otherIncomes = \App\Models\RetailIncome::whereBetween('tanggal', [$start, $end])->sum('nominal');

        $expensesByCategory = RetailExpense::whereBetween('tanggal', [$start, $end])
            ->selectRaw('kategori, SUM(nominal) as total')
            ->groupBy('kategori')
            ->get();
        $totalExpenses = $expensesByCategory->sum('total');

        $netProfit = $grossProfit - $totalExpenses + $otherIncomes;

        return response()->json([
            'period' => ['start' => $start, 'end' => $end],
            'revenue' => $revenue,
            'discounts' => $discounts,
            'tax' => $tax,
            'cogs' => $cogs,
            'gross_profit' => $grossProfit,
            'expenses_by_category' => $expensesByCategory,
            'total_expenses' => $totalExpenses,
            'other_incomes' => $otherIncomes,
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

    // GET /api/retail/reports/consignment?startDate=&endDate=
    public function consignment(Request $request)
    {
        $start = $request->query('startDate', now()->startOfMonth()->toDateString());
        $end = $request->query('endDate', now()->toDateString());

        // We want to find all consignment products that were sold (in paid transactions) within the date range.
        $items = RetailTransactionItem::with(['product.supplier', 'transaction'])
            ->whereHas('transaction', function ($q) use ($start, $end) {
                $q->where('status', 'paid')->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"]);
            })
            ->whereHas('product', function ($q) {
                $q->where('is_consignment', true);
            })
            ->get();

        // Group by supplier
        $grouped = [];
        $totalPayable = 0;

        foreach ($items as $item) {
            if (!$item->product) continue;
            
            $supplierId = $item->product->supplier_id ?: 0;
            $supplierName = $item->product->supplier ? $item->product->supplier->name : 'Tanpa Supplier';

            if (!isset($grouped[$supplierId])) {
                $grouped[$supplierId] = [
                    'supplier_id' => $supplierId,
                    'supplier_name' => $supplierName,
                    'total_qty' => 0,
                    'total_payable' => 0,
                    'products' => []
                ];
            }

            $prodId = $item->product_id;
            if (!isset($grouped[$supplierId]['products'][$prodId])) {
                $grouped[$supplierId]['products'][$prodId] = [
                    'product_id' => $prodId,
                    'sku' => $item->product->sku,
                    'name' => $item->product->name,
                    'qty' => 0,
                    'cost_price' => $item->cost_price,
                    'total_payable' => 0,
                ];
            }

            $grouped[$supplierId]['products'][$prodId]['qty'] += $item->qty;
            $grouped[$supplierId]['products'][$prodId]['total_payable'] += ($item->qty * $item->cost_price);

            $grouped[$supplierId]['total_qty'] += $item->qty;
            $grouped[$supplierId]['total_payable'] += ($item->qty * $item->cost_price);
            $totalPayable += ($item->qty * $item->cost_price);
        }

        // Format products back to array
        foreach ($grouped as &$g) {
            $g['products'] = array_values($g['products']);
        }

        return response()->json([
            'period' => ['start' => $start, 'end' => $end],
            'total_consignment_payable' => $totalPayable,
            'data' => array_values($grouped),
        ]);
    }

    public function customersReport(Request $request) {
        $tenantId = auth()->user()->tenant_id;
        
        $thisMonth = now()->format('Y-m');
        $lastMonth = now()->subMonth()->format('Y-m');
        $thisYear = now()->year;
        $lastYear = now()->subYear()->year;

        // 1. Top Customers with Growth Metrics
        $topCustomers = RetailTransaction::where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereNotNull('customer_id')
            ->select(
                'customer_id', 
                DB::raw('SUM(total_amount) as total_spent'), 
                DB::raw('COUNT(*) as visit_count'), 
                DB::raw('AVG(total_amount) as avg_spent'),
                DB::raw("SUM(CASE WHEN DATE_FORMAT(created_at, '%Y-%m') = '{$thisMonth}' THEN total_amount ELSE 0 END) as this_month_spent"),
                DB::raw("SUM(CASE WHEN DATE_FORMAT(created_at, '%Y-%m') = '{$lastMonth}' THEN total_amount ELSE 0 END) as last_month_spent"),
                DB::raw("SUM(CASE WHEN YEAR(created_at) = '{$thisYear}' THEN total_amount ELSE 0 END) as this_year_spent"),
                DB::raw("SUM(CASE WHEN YEAR(created_at) = '{$lastYear}' THEN total_amount ELSE 0 END) as last_year_spent")
            )
            ->groupBy('customer_id')
            ->orderByDesc('total_spent')
            ->with('customer')
            ->take(50)
            ->get();

        $top5Ids = $topCustomers->take(5)->pluck('customer_id')->toArray();

        // 2. Monthly Spending Trends (Top 5 Customers)
        $monthlySpending = RetailTransaction::where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereIn('customer_id', $top5Ids)
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->select(
                'customer_id',
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as label"), 
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('customer_id', 'label')
            ->orderBy('label', 'asc')
            ->get();

        // 3. Yearly Spending Trends (Top 5 Customers)
        $yearlySpending = RetailTransaction::where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereIn('customer_id', $top5Ids)
            ->where('created_at', '>=', now()->subYears(4)->startOfYear())
            ->select(
                'customer_id',
                DB::raw("YEAR(created_at) as label"),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('customer_id', 'label')
            ->orderBy('label', 'asc')
            ->get();

        return response()->json([
            'top_customers' => $topCustomers,
            'monthly_spending' => $monthlySpending,
            'yearly_spending' => $yearlySpending
        ]);
    }

    // GET /api/retail/reports/shifts?startDate=&endDate=
    public function shiftsReport(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;
        $start = $request->query('startDate', now()->startOfMonth()->toDateString());
        $end = $request->query('endDate', now()->toDateString());

        $shifts = \App\Models\RetailShift::where('tenant_id', $tenantId)
            ->whereBetween('opened_at', ["$start 00:00:00", "$end 23:59:59"])
            ->with('user')
            ->latest('opened_at')
            ->get();

        $total_shifts = $shifts->count();
        $total_expected = $shifts->sum('expected_cash');
        $total_actual = $shifts->sum('closing_cash');
        $total_variance = $shifts->sum('difference');

        $chart_data = [];
        $shiftsByDate = $shifts->groupBy(function($shift) {
            return $shift->opened_at ? $shift->opened_at->format('d M') : 'N/A';
        });

        foreach($shiftsByDate as $date => $dayShifts) {
            $pagi = 0; $siang = 0; $malam = 0;
            foreach($dayShifts as $s) {
                // simple heuristic for shift name based on hour
                $hour = $s->opened_at ? $s->opened_at->hour : 0;
                if ($hour >= 5 && $hour < 14) $pagi += $s->closing_cash;
                elseif ($hour >= 14 && $hour < 22) $siang += $s->closing_cash;
                else $malam += $s->closing_cash;
            }
            $chart_data[] = [
                'name' => $date,
                'pagi' => $pagi,
                'siang' => $siang,
                'malam' => $malam
            ];
        }

        // Format shifts for frontend table
        $shiftsFormatted = $shifts->map(function($s) {
            $hour = $s->opened_at ? $s->opened_at->hour : 0;
            $shift_name = 'Shift Pagi';
            if ($hour >= 14 && $hour < 22) $shift_name = 'Shift Siang';
            if ($hour >= 22 || $hour < 5) $shift_name = 'Shift Malam';

            return [
                'id' => $s->id,
                'date' => $s->opened_at,
                'shift_name' => $shift_name,
                'cashier_name' => $s->user ? $s->user->name : 'Unknown',
                'opening_balance' => (float) $s->opening_cash,
                'expected_balance' => (float) $s->expected_cash,
                'actual_balance' => (float) $s->closing_cash,
                'variance' => (float) $s->difference,
                'status' => $s->status
            ];
        });

        return response()->json([
            'total_shifts' => $total_shifts,
            'total_expected' => (float) $total_expected,
            'total_actual' => (float) $total_actual,
            'total_variance' => (float) $total_variance,
            'chart_data' => array_reverse($chart_data),
            'shifts' => $shiftsFormatted
        ]);
    }

    // GET /api/retail/reports/payments?startDate=&endDate=
    public function paymentsReport(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;
        $start = $request->query('startDate', now()->startOfMonth()->toDateString());
        $end = $request->query('endDate', now()->toDateString());

        $transactions = RetailTransaction::where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"])
            ->with('payments')
            ->latest()
            ->get();

        $total_tax = $transactions->sum('tax_amount');
        $paymentsFormatted = [];
        $total_payments = 0;

        $methodsAgg = [];

        foreach($transactions as $tx) {
            foreach($tx->payments as $payment) {
                $total_payments += $payment->amount;
                $method = $payment->payment_method ?: 'Tunai';
                
                if (!isset($methodsAgg[$method])) {
                    $methodsAgg[$method] = 0;
                }
                $methodsAgg[$method] += $payment->amount;

                // For simplicity, prorate tax if multiple payments, or just assign it to the first payment record
                $paymentsFormatted[] = [
                    'id' => $payment->id,
                    'date' => $payment->created_at ?: $tx->created_at,
                    'invoice_no' => $tx->invoice_number ?: ('INV/' . $tx->id),
                    'method' => $method,
                    'subtotal' => (float) ($tx->total_amount - $tx->tax_amount),
                    'tax' => (float) $tx->tax_amount,
                    'total' => (float) $payment->amount,
                    'status' => 'success'
                ];
            }
        }

        $chart_data = [];
        foreach($methodsAgg as $method => $val) {
            $chart_data[] = [
                'name' => ucfirst($method),
                'value' => (float) $val
            ];
        }

        return response()->json([
            'total_payments' => (float) $total_payments,
            'total_tax' => (float) $total_tax,
            'chart_data' => $chart_data,
            'payments' => $paymentsFormatted
        ]);
    }
}
