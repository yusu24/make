<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailExpense;
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
        $expensesQuery = RetailExpense::query();

        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            $expensesQuery->whereBetween('tanggal', [$startDate, $endDate]);
        }

        $totalSales = $salesQuery->sum('total_amount');
        $totalExpenses = $expensesQuery->sum('nominal');
        $profit = $totalSales - $totalExpenses;

        return response()->json([
            'total_sales' => $totalSales,
            'total_expenses' => $totalExpenses,
            'profit' => $profit,
        ]);
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

        $expensesByCategory = RetailExpense::whereDate('tanggal', $date)
            ->selectRaw('kategori, SUM(nominal) as total')
            ->groupBy('kategori')
            ->get();

        $payablePayments = RetailPayablePayment::whereDate('paid_at', $date)->sum('amount_paid');

        $inflow = $salesByMethod->sum('total') + $receivablePayments;
        $outflow = $expensesByCategory->sum('total') + $payablePayments;

        return response()->json([
            'date' => $date,
            'inflow' => [
                'sales_by_method' => $salesByMethod,
                'receivable_payments' => $receivablePayments,
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
            'expense_category_id' => 'nullable|integer|exists:retail_expense_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = $request->expense_category_id
            ? \App\Models\RetailExpenseCategory::find($request->expense_category_id)
            : null;

        $expense = RetailExpense::create([
            'user_id' => Auth::id(),
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'expense_category_id' => $request->expense_category_id,
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
            'expense_category_id' => 'nullable|integer|exists:retail_expense_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = $request->expense_category_id
            ? \App\Models\RetailExpenseCategory::find($request->expense_category_id)
            : null;

        $expense->update([
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'expense_category_id' => $request->expense_category_id,
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
}
