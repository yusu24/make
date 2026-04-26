<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaInventory;
use App\Models\BudidayaExpense;
use Illuminate\Support\Facades\DB;

class FeedingController extends Controller
{
    public function store(Request $request, $cycleId)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($cycleId);

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen)'], 400);
        }

        $validated = $request->validate([
            'inventory_id' => 'required|exists:budidaya_inventories,id',
            'amount_kg' => 'required|numeric|min:0.1',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $inventory = BudidayaInventory::where('tenant_id', $tenantId)->findOrFail($validated['inventory_id']);

        if (strtolower($inventory->category) !== 'pakan') {
            return response()->json(['message' => 'Barang yang dipilih bukan pakan'], 400);
        }

        if ($inventory->stock < $validated['amount_kg']) {
            return response()->json(['message' => 'Stok pakan tidak mencukupi'], 400);
        }

        DB::transaction(function () use ($tenantId, $cycle, $validated, $inventory) {
            // 1. Record Feeding
            BudidayaFeeding::create([
                'cycle_id' => $cycle->id,
                'inventory_id' => $inventory->id,
                'amount_kg' => $validated['amount_kg'],
                'date' => $validated['date'],
                'notes' => $validated['notes'],
            ]);

            // 2. Deduct Inventory
            $inventory->decrement('stock', $validated['amount_kg']);
            
            $inventory->logs()->create([
                'type' => 'out',
                'quantity' => $validated['amount_kg'],
                'note' => 'Pemberian pakan Kolam: ' . $cycle->pond->name,
                'transaction_date' => $validated['date'],
            ]);

            // 3. Record Expense
            $totalCost = $validated['amount_kg'] * $inventory->price_per_unit;
            BudidayaExpense::create([
                'tenant_id' => $tenantId,
                'cycle_id' => $cycle->id,
                'category' => 'pakan',
                'amount' => $totalCost,
                'date' => $validated['date'],
                'notes' => 'Biaya pakan ' . $validated['amount_kg'] . ' kg ' . $inventory->name,
            ]);
        });

        return response()->json(['message' => 'Pemberian pakan berhasil dicatat']);
    }
}
