<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailExpense;
use App\Models\RetailIncome;
use App\Models\RetailFinanceCategory;
use App\Models\RetailPayablePayment;
use App\Models\RetailReceivablePayment;
use App\Models\RetailTransaction;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class RetailFinanceController extends Controller
{
    // GET /api/retail/finance/summary
    public function getSummary(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $salesQuery = RetailTransaction::where('status', 'paid');
        $incomesQuery = RetailIncome::query();
        $expensesQuery = RetailExpense::query();

        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            $incomesQuery->whereBetween('tanggal', [$startDate, $endDate]);
            $expensesQuery->whereBetween('tanggal', [$startDate, $endDate]);
        }

        $transactions = $salesQuery->with('items')->get();
        
        $totalSales = 0;
        $totalCogs = 0;
        $totalDiscounts = 0;
        $totalTax = 0;

        foreach ($transactions as $tx) {
            $totalDiscounts += $tx->discount_amount;
            $totalTax += $tx->tax_amount;
            
            $itemSubtotal = 0;
            foreach ($tx->items as $item) {
                $itemSubtotal += ($item->price * $item->qty);
                $totalCogs += ($item->cost_price * $item->qty);
            }
            $totalSales += $itemSubtotal; // Gross revenue before global discount and tax
        }

        $totalIncomes = $incomesQuery->sum('nominal');
        $totalExpenses = $expensesQuery->sum('nominal');
        
        $grossProfit = $totalSales - $totalDiscounts - $totalCogs;
        $profit = $grossProfit + $totalIncomes - $totalExpenses;

        return response()->json([
            'total_sales' => $totalSales - $totalDiscounts, // Net sales
            'total_incomes' => $totalIncomes,
            'total_expenses' => $totalExpenses,
            'total_cogs' => $totalCogs,
            'profit' => $profit,
        ]);
    }

    // GET /api/retail/finance/ledger
    public function getLedger(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $salesQuery = RetailTransaction::where('status', 'paid');
        $incomesQuery = RetailIncome::with('category');
        $expensesQuery = RetailExpense::with('category');

        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            $incomesQuery->whereBetween('tanggal', [$startDate, $endDate]);
            $expensesQuery->whereBetween('tanggal', [$startDate, $endDate]);
        }

        $sales = $salesQuery->get()->map(function ($s) {
            return [
                'id' => 'sale_' . $s->id,
                'date' => $s->created_at->toDateTimeString(),
                'type' => 'income',
                'category' => 'Penjualan',
                'description' => 'Penjualan ' . $s->invoice_no,
                'amount' => $s->total_amount,
            ];
        });

        $incomes = $incomesQuery->get()->map(function ($i) {
            return [
                'id' => 'inc_' . $i->id,
                'date' => $i->tanggal . ' 00:00:00',
                'type' => 'income',
                'category' => $i->category->name ?? 'Lainnya',
                'description' => 'Pemasukan: ' . $i->keterangan,
                'amount' => $i->nominal,
            ];
        });

        $expenses = $expensesQuery->get()->map(function ($e) {
            return [
                'id' => 'exp_' . $e->id,
                'date' => $e->tanggal . ' 00:00:00',
                'type' => 'expense',
                'category' => $e->category->name ?? $e->kategori ?? 'Lainnya',
                'description' => 'Pengeluaran: ' . $e->keterangan,
                'amount' => $e->nominal,
            ];
        });

        $ledger = $sales->concat($incomes)->concat($expenses)->sortByDesc('date')->values()->all();

        return response()->json($ledger);
    }

    // GET /api/retail/finance/cash-summary?date=YYYY-MM-DD
    public function getCashSummary(Request $request)
    {
        $date = $request->query('date', now()->toDateString());

        $salesByMethod = RetailTransaction::where('status', 'paid')
            ->whereDate('created_at', $date)
            ->selectRaw('payment_method, SUM(total_amount) as total')
            ->groupBy('payment_method')
            ->get();

        $receivablePayments = RetailReceivablePayment::whereDate('paid_at', $date)->sum('amount_paid');
        $otherIncomes = RetailIncome::whereDate('tanggal', $date)->sum('nominal');

        $expensesByCategory = RetailExpense::whereDate('tanggal', $date)
            ->selectRaw('kategori, SUM(nominal) as total')
            ->groupBy('kategori')
            ->get();

        $payablePayments = RetailPayablePayment::whereDate('paid_at', $date)->sum('amount_paid');

        $inflow = $salesByMethod->sum('total') + $receivablePayments + $otherIncomes;
        $outflow = $expensesByCategory->sum('total') + $payablePayments;

        return response()->json([
            'date' => $date,
            'inflow' => [
                'sales_by_method' => $salesByMethod,
                'receivable_payments' => $receivablePayments,
                'other_incomes' => $otherIncomes,
                'total' => $inflow,
            ],
            'outflow' => [
                'expenses_by_category' => $expensesByCategory,
                'payable_payments' => $payablePayments,
                'total' => $outflow,
            ],
            'net_cash' => $inflow - $outflow,
        ]);
    }

    // GET /api/retail/finance/expenses
    public function index(Request $request)
    {
        $query = RetailExpense::with(['user:id,name', 'category']);

        if ($request->has('startDate') && $request->has('endDate')) {
            $query->whereBetween('tanggal', [$request->startDate, $request->endDate]);
        }

        $expenses = $query->orderBy('tanggal', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json($expenses);
    }

    // POST /api/retail/finance/expenses
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'finance_category_id' => 'nullable|integer|exists:retail_finance_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = $request->finance_category_id
            ? RetailFinanceCategory::find($request->finance_category_id)
            : null;

        $expense = RetailExpense::create([
            'user_id' => Auth::id(),
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'finance_category_id' => $request->finance_category_id,
            'kategori' => $category->name ?? 'Lainnya',
        ]);

        return response()->json(['message' => 'Pengeluaran berhasil ditambahkan', 'data' => $expense], 201);
    }

    // PUT /api/retail/finance/expenses/{id}
    public function update(Request $request, int $id)
    {
        $expense = RetailExpense::find($id);

        if (!$expense) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'finance_category_id' => 'nullable|integer|exists:retail_finance_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = $request->finance_category_id
            ? RetailFinanceCategory::find($request->finance_category_id)
            : null;

        $expense->update([
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'finance_category_id' => $request->finance_category_id,
            'kategori' => $category->name ?? $expense->kategori,
        ]);

        return response()->json(['message' => 'Pengeluaran berhasil diupdate', 'data' => $expense]);
    }

    // DELETE /api/retail/finance/expenses/{id}
    public function destroy(int $id)
    {
        $expense = RetailExpense::find($id);

        if (!$expense) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $expense->delete();
        return response()->json(['message' => 'Pengeluaran berhasil dihapus']);
    }

    // -------------------------------------------------------------------------
    // INCOMES CRUD
    // -------------------------------------------------------------------------

    // GET /api/retail/finance/incomes
    public function getIncomes(Request $request)
    {
        $query = RetailIncome::with(['user:id,name', 'category']);

        if ($request->has('startDate') && $request->has('endDate')) {
            $query->whereBetween('tanggal', [$request->startDate, $request->endDate]);
        }

        $incomes = $query->orderBy('tanggal', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json($incomes);
    }

    // POST /api/retail/finance/incomes
    public function storeIncome(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'finance_category_id' => 'nullable|integer|exists:retail_finance_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = $request->finance_category_id
            ? RetailFinanceCategory::find($request->finance_category_id)
            : null;

        $income = RetailIncome::create([
            'user_id' => Auth::id(),
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'finance_category_id' => $request->finance_category_id,
            'kategori' => $category->name ?? 'Lainnya',
        ]);

        return response()->json(['message' => 'Pemasukan berhasil ditambahkan', 'data' => $income], 201);
    }

    // PUT /api/retail/finance/incomes/{id}
    public function updateIncome(Request $request, int $id)
    {
        $income = RetailIncome::find($id);

        if (!$income) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'finance_category_id' => 'nullable|integer|exists:retail_finance_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = $request->finance_category_id
            ? RetailFinanceCategory::find($request->finance_category_id)
            : null;

        $income->update([
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'finance_category_id' => $request->finance_category_id,
            'kategori' => $category->name ?? $income->kategori,
        ]);

        return response()->json(['message' => 'Pemasukan berhasil diupdate', 'data' => $income]);
    }

    // DELETE /api/retail/finance/incomes/{id}
    public function destroyIncome(int $id)
    {
        $income = RetailIncome::find($id);

        if (!$income) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $income->delete();
        return response()->json(['message' => 'Pemasukan berhasil dihapus']);
    }

    // -------------------------------------------------------------------------
    // ADVANCED FINANCE (CASH TRANSFERS, CASH FLOW, TAX REPORT)
    // -------------------------------------------------------------------------
    
    // GET /api/retail/finance/transfers
    public function getTransfers(Request $request)
    {
        $query = \App\Models\RetailCashTransfer::with(['user:id,name']);

        if ($request->has('startDate') && $request->has('endDate')) {
            $query->whereBetween('transfer_date', [$request->startDate, $request->endDate]);
        }

        $transfers = $query->orderBy('transfer_date', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json($transfers);
    }

    // POST /api/retail/finance/transfers
    public function storeTransfer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transfer_date' => 'required|date',
            'from_method' => 'required|string|max:50',
            'to_method' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $transfer = \App\Models\RetailCashTransfer::create([
            'user_id' => Auth::id(),
            'transfer_date' => $request->transfer_date,
            'from_method' => $request->from_method,
            'to_method' => $request->to_method,
            'amount' => $request->amount,
            'note' => $request->note,
        ]);

        return response()->json(['message' => 'Mutasi Kas berhasil ditambahkan', 'data' => $transfer], 201);
    }
    
    // DELETE /api/retail/finance/transfers/{id}
    public function destroyTransfer(int $id)
    {
        $transfer = \App\Models\RetailCashTransfer::find($id);

        if (!$transfer) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $transfer->delete();
        return response()->json(['message' => 'Mutasi Kas berhasil dihapus']);
    }

    // GET /api/retail/finance/cash-flow
    public function getCashFlow(Request $request)
    {
        $startDate = $request->query('startDate', now()->startOfMonth()->toDateString());
        $endDate = $request->query('endDate', now()->endOfMonth()->toDateString());

        // Inflows
        // Cash Sales: using RetailTransactionPayment excluding PIUTANG
        $sales = \App\Models\RetailTransactionPayment::whereHas('transaction', function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        })->where('payment_method', '!=', 'PIUTANG')->sum('amount');
            
        $receivablePayments = RetailReceivablePayment::whereBetween('paid_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('amount_paid');
            
        $otherIncomes = RetailIncome::whereBetween('tanggal', [$startDate, $endDate])
            ->sum('nominal');

        // Outflows
        // Purchases paid directly (no payable created for it)
        $payablePurchaseIds = \App\Models\RetailPayable::whereNotNull('purchase_id')->pluck('purchase_id')->toArray();
        $purchases = \App\Models\RetailPurchase::whereBetween('purchase_date', [$startDate, $endDate])
            ->whereNotIn('id', $payablePurchaseIds)
            ->sum('total_cost'); 
            
        $payablePayments = RetailPayablePayment::whereBetween('paid_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('amount_paid');
            
        $otherExpenses = RetailExpense::whereBetween('tanggal', [$startDate, $endDate])
            ->sum('nominal');

        $totalInflow = $sales + $receivablePayments + $otherIncomes;
        $totalOutflow = $purchases + $otherExpenses + $payablePayments; // purchases added
        
        $netCash = $totalInflow - $totalOutflow;

        return response()->json([
            'inflow' => [
                'sales' => $sales,
                'receivable_payments' => $receivablePayments,
                'other_incomes' => $otherIncomes,
                'total' => $totalInflow,
            ],
            'outflow' => [
                'payable_payments' => $payablePayments,
                'other_expenses' => $otherExpenses,
                'total' => $totalOutflow,
            ],
            'net_cash' => $netCash,
            'period' => compact('startDate', 'endDate')
        ]);
    }

    // GET /api/retail/finance/tax-report
    public function getTaxReport(Request $request)
    {
        $startDate = $request->query('startDate', now()->startOfMonth()->toDateString());
        $endDate = $request->query('endDate', now()->endOfMonth()->toDateString());

        $transactions = RetailTransaction::where('status', 'paid')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->where('tax_amount', '>', 0)
            ->get(['id', 'invoice_no', 'created_at', 'total_amount', 'tax_amount']);
            
        $totalTax = $transactions->sum('tax_amount');
        $totalSalesWithTax = $transactions->sum('total_amount');

        return response()->json([
            'transactions' => $transactions,
            'summary' => [
                'total_tax' => $totalTax,
                'total_sales_with_tax' => $totalSalesWithTax,
            ]
        ]);
    }
}
