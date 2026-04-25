<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailExpense;
use App\Models\RetailTransaction;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class RetailFinanceController extends Controller
{
    // GET /api/retail/finance/summary
    // Menerima startDate dan endDate optional
    public function getSummary(Request $request)
    {
        $tenant_id = Auth::user()->tenant_id;
        if (!$tenant_id) {
            return response()->json(['message' => 'Tenant ID tidak ditemukan'], 400);
        }

        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        // Build query for sales
        $salesQuery = RetailTransaction::where('tenant_id', $tenant_id);
        $expensesQuery = RetailExpense::where('tenant_id', $tenant_id);

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

    // GET /api/retail/finance/expenses
    public function index(Request $request)
    {
        $tenant_id = Auth::user()->tenant_id;
        
        $query = RetailExpense::with('user:id,name')->where('tenant_id', $tenant_id);

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
            'kategori' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expense = RetailExpense::create([
            'tenant_id' => Auth::user()->tenant_id,
            'user_id' => Auth::id(),
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'kategori' => $request->kategori ?? 'Lainnya',
        ]);

        return response()->json(['message' => 'Pengeluaran berhasil ditambahkan', 'data' => $expense], 201);
    }

    // PUT /api/retail/finance/expenses/{id}
    public function update(Request $request, $id)
    {
        $tenant_id = Auth::user()->tenant_id;
        $expense = RetailExpense::where('id', $id)->where('tenant_id', $tenant_id)->first();

        if (!$expense) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'kategori' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expense->update([
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
            'nominal' => $request->nominal,
            'kategori' => $request->kategori ?? 'Lainnya',
        ]);

        return response()->json(['message' => 'Pengeluaran berhasil diupdate', 'data' => $expense]);
    }

    // DELETE /api/retail/finance/expenses/{id}
    public function destroy($id)
    {
        $tenant_id = Auth::user()->tenant_id;
        $expense = RetailExpense::where('id', $id)->where('tenant_id', $tenant_id)->first();

        if (!$expense) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $expense->delete();
        return response()->json(['message' => 'Pengeluaran berhasil dihapus']);
    }
}
