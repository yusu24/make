<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaExpense;
use App\Models\BudidayaInventory;
use Illuminate\Support\Facades\DB;

class CycleController extends Controller
{
    public function show($pondId, Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $pond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($pondId);
        
        $activeCycle = $pond->activeCycle()->with(['feedings.inventory', 'healths', 'expenses'])->first();

        if (!$activeCycle) {
            return response()->json(['data' => null, 'message' => 'Tidak ada siklus aktif']);
        }

        // Calculate age
        $ageDays = now()->diffInDays($activeCycle->seed_date);

        // Calculate totals
        $totalFeedCost = $activeCycle->expenses()->where('category', 'pakan')->sum('amount');
        $totalSeedCost = $activeCycle->expenses()->where('category', 'benih')->sum('amount');
        $totalFeedKg = $activeCycle->feedings()->sum('amount_kg');

        return response()->json([
            'data' => [
                'cycle' => $activeCycle,
                'age_days' => $ageDays,
                'metrics' => [
                    'total_feed_kg' => $totalFeedKg,
                    'total_feed_cost' => $totalFeedCost,
                    'total_seed_cost' => $totalSeedCost,
                    'total_cost' => $activeCycle->expenses()->sum('amount'),
                ]
            ]
        ]);
    }

    public function start(Request $request, $pondId)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $pond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($pondId);

        if ($pond->activeCycle) {
            return response()->json(['message' => 'Kolam masih memiliki siklus aktif'], 400);
        }

        $validated = $request->validate([
            'inventory_id' => 'required|exists:budidaya_inventories,id', // Seed inventory
            'seed_count' => 'required|integer|min:1',
            'seed_date' => 'required|date',
            'expected_harvest_date' => 'nullable|date',
        ]);

        $inventory = BudidayaInventory::where('tenant_id', $tenantId)->findOrFail($validated['inventory_id']);
        
        if (strtolower($inventory->category) !== 'bibit') {
            return response()->json(['message' => 'Barang yang dipilih bukan bibit'], 400);
        }

        if ($inventory->stock < $validated['seed_count']) {
            return response()->json(['message' => 'Stok bibit tidak mencukupi'], 400);
        }

        DB::transaction(function () use ($tenantId, $pond, $validated, $inventory) {
            // 1. Create Cycle
            $cycle = BudidayaCycle::create([
                'tenant_id' => $tenantId,
                'pond_id' => $pond->id,
                'seed_type' => $inventory->name,
                'seed_count' => $validated['seed_count'],
                'seed_date' => $validated['seed_date'],
                'expected_harvest_date' => $validated['expected_harvest_date'],
                'status' => 'pembibitan',
            ]);

            // 2. Deduct inventory
            $inventory->decrement('stock', $validated['seed_count']);
            
            // Log inventory out
            $inventory->logs()->create([
                'type' => 'out',
                'quantity' => $validated['seed_count'],
                'note' => 'Tebar benih ke Kolam: ' . $pond->name,
                'transaction_date' => now(),
            ]);

            // 3. Record Expense
            $totalCost = $validated['seed_count'] * $inventory->price_per_unit;
            BudidayaExpense::create([
                'tenant_id' => $tenantId,
                'cycle_id' => $cycle->id,
                'category' => 'benih',
                'amount' => $totalCost,
                'date' => $validated['seed_date'],
                'notes' => 'Biaya tebar benih ' . $validated['seed_count'] . ' ekor ' . $inventory->name,
            ]);
        });

        return response()->json(['message' => 'Siklus berhasil dimulai']);
    }
}
