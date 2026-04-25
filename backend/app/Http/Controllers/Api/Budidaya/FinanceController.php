<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaExpense;
use App\Models\BudidayaCycle;

class FinanceController extends Controller
{
    // List all expenses
    public function index(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
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
        $tenantId = $request->attributes->get('tenant_id');
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
        $tenantId = $request->attributes->get('tenant_id');
        $expense = BudidayaExpense::where('tenant_id', $tenantId)->findOrFail($id);
        
        $expense->delete();
        return response()->json(['message' => 'Catatan pengeluaran dihapus']);
    }
}
