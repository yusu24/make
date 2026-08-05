<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaExpense;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;

class FinanceController extends Controller
{
    // List all expenses
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cycleId = $request->query('cycle_id');

        $query = BudidayaExpense::where('tenant_id', $tenantId)->orderBy('date', 'desc');
        
        if ($cycleId) {
            $query->where('cycle_id', $cycleId);
        }

        return response()->json(['data' => $query->get()]);
    }

    // Add an expense 
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'cycle_id' => 'nullable|exists:budidaya_cycles,id'
        ]);

        if ($request->cycle_id) {
            // Verify cycle belongs to tenant
            $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($request->cycle_id);
        }

        $expense = BudidayaExpense::create([
            'tenant_id' => $tenantId,
            'cycle_id' => $request->cycle_id,
            'category' => $request->category,
            'amount' => $request->amount,
            'date' => $request->date,
            'notes' => $request->notes
        ]);

        return response()->json(['message' => 'Pengeluaran dicatat', 'data' => $expense]);
    }

    // Delete an expense
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $expense = BudidayaExpense::where('tenant_id', $tenantId)->findOrFail($id);
        
        $expense->delete();
        return response()->json(['message' => 'Catatan pengeluaran dihapus']);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $expense = BudidayaExpense::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        if ($expense->cycle) {
            if ($expense->cycle->status === 'panen') {
                return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat mengubah biaya.'], 400);
            }
        }

        $expense->update([
            'category' => $request->category,
            'amount' => $request->amount,
            'date' => $request->date,
            'notes' => $request->notes
        ]);

        return response()->json(['message' => 'Pengeluaran berhasil diperbarui', 'data' => $expense]);
    }

    public function getSummary(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $harvestQuery = BudidayaHarvest::whereHas('cycle', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        });
        
        $expenseQuery = BudidayaExpense::where('tenant_id', $tenantId);

        if ($startDate && $endDate) {
            $harvestQuery->whereBetween('harvest_date', [$startDate, $endDate]);
            $expenseQuery->whereBetween('date', [$startDate, $endDate]);
        }

        $totalSales = $harvestQuery->sum('total_revenue');
        $totalExpenses = $expenseQuery->sum('amount');

        return response()->json([
            'total_sales' => $totalSales,
            'total_expenses' => $totalExpenses,
            'profit' => $totalSales - $totalExpenses
        ]);
    }

    public function getLedger(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $harvestQuery = BudidayaHarvest::whereHas('cycle', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->with(['cycle.pond']);
        
        $expenseQuery = BudidayaExpense::where('tenant_id', $tenantId)->with(['cycle.pond']);

        if ($startDate && $endDate) {
            $harvestQuery->whereBetween('harvest_date', [$startDate, $endDate]);
            $expenseQuery->whereBetween('date', [$startDate, $endDate]);
        } else {
            $harvestQuery->limit(500);
            $expenseQuery->limit(500);
        }

        $harvests = $harvestQuery->orderBy('harvest_date', 'desc')->get()->map(function ($h) {
            return [
                'id' => 'HAR-' . $h->id,
                'original_id' => $h->id,
                'type' => 'income',
                'date' => $h->harvest_date,
                'category' => 'Panen',
                'description' => 'Panen Kolam: ' . ($h->cycle->pond->name ?? 'N/A') . ($h->notes ? ' - ' . $h->notes : ''),
                'amount' => $h->total_revenue,
                'status' => 'completed',
                'raw_data' => $h
            ];
        });

        $expenses = $expenseQuery->orderBy('date', 'desc')->get()->map(function ($e) {
            $pondName = $e->cycle ? ($e->cycle->pond->name ?? 'N/A') : 'Umum';
            return [
                'id' => 'EXP-' . $e->id,
                'original_id' => $e->id,
                'type' => 'expense',
                'date' => $e->date,
                'category' => $e->category,
                'description' => $e->notes ? $e->notes . " ($pondName)" : "Pengeluaran ($pondName)",
                'amount' => $e->amount,
                'status' => 'completed',
                'raw_data' => $e
            ];
        });

        $ledger = $harvests->concat($expenses)->sortByDesc('date')->values();
        
        return response()->json($ledger);
    }
}
