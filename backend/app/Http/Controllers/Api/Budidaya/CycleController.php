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
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $query = BudidayaCycle::query();
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }
        
        $cycles = $query->with(['pond'])
            ->withSum('expenses as total_cost', 'amount')
            ->withSum('harvests as total_revenue', 'total_revenue')
            ->withCount('harvests')
            ->orderBy('created_at', 'desc')
            ->get();
        
        $data = $cycles->map(function ($cycle) {
            $cost = $cycle->total_cost ?? 0;
            $revenue = $cycle->total_revenue ?? 0;
            
            return [
                'id' => $cycle->id,
                'pond_name' => $cycle->pond->name ?? 'N/A',
                'seed_type' => $cycle->seed_type,
                'seed_count' => $cycle->seed_count,
                'seed_date' => $cycle->seed_date ? $cycle->seed_date->format('Y-m-d') : null,
                'status' => $cycle->status,
                'total_cost' => $cost,
                'total_revenue' => $revenue,
                'profit' => $revenue - $cost,
                'harvest_count' => $cycle->harvests_count ?? 0,
            ];
        });

        return response()->json(['data' => $data]);
    }

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
            'inventory_id' => 'nullable|exists:budidaya_inventories,id', // Seed inventory (optional)
            'seed_type' => 'nullable|string|max:100', // For manual input
            'seed_count' => 'required|integer|min:1',
            'seed_date' => 'required|date',
            'total_seed_cost' => 'nullable|numeric|min:0', // For manual input
            'expected_harvest_date' => 'nullable|date',
        ]);

        $inventory = null;
        if ($request->filled('inventory_id')) {
            $inventory = BudidayaInventory::where('tenant_id', $tenantId)->findOrFail($validated['inventory_id']);
            
            if (strtolower($inventory->category) !== 'bibit') {
                return response()->json(['message' => 'Barang yang dipilih bukan bibit'], 400);
            }

            if ($inventory->stock < $validated['seed_count']) {
                return response()->json(['message' => 'Stok bibit tidak mencukupi'], 400);
            }
        } else {
            // Manual validation
            if (!$request->filled('seed_type')) {
                return response()->json(['message' => 'Tipe bibit harus diisi jika tidak memilih dari gudang'], 400);
            }
        }

        return DB::transaction(function () use ($tenantId, $pond, $validated, $inventory) {
            $seedType = $inventory ? $inventory->name : $validated['seed_type'];
            $totalCost = $inventory 
                ? ($validated['seed_count'] * $inventory->price_per_unit)
                : ($validated['total_seed_cost'] ?? 0);

            // 1. Create Cycle
            $cycle = BudidayaCycle::create([
                'tenant_id' => $tenantId,
                'pond_id' => $pond->id,
                'seed_type' => $seedType,
                'seed_count' => $validated['seed_count'],
                'seed_date' => $validated['seed_date'],
                'expected_harvest_date' => $validated['expected_harvest_date'],
                'status' => 'pembibitan',
            ]);

            // 2. Handle Inventory if applicable
            if ($inventory) {
                $inventory->decrement('stock', $validated['seed_count']);
                
                $inventory->logs()->create([
                    'inventory_id' => $inventory->id, // Added for clarity
                    'type' => 'out',
                    'quantity' => $validated['seed_count'],
                    'note' => 'Tebar benih ke Kolam: ' . $pond->name,
                    'transaction_date' => now(),
                ]);
            }

            // 3. Record Expense
            BudidayaExpense::create([
                'tenant_id' => $tenantId,
                'cycle_id' => $cycle->id,
                'category' => 'benih',
                'amount' => $totalCost,
                'date' => $validated['seed_date'],
                'notes' => 'Biaya tebar benih ' . $validated['seed_count'] . ' ekor ' . $seedType,
            ]);

            return response()->json([
                'message' => 'Siklus berhasil dimulai',
                'data' => $cycle
            ]);
        });
    }

    public function details($id, Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $query = BudidayaCycle::with(['pond', 'feedings', 'healths', 'harvests', 'expenses']);
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $cycle = $query->findOrFail($id);

        $totalCost = $cycle->expenses()->sum('amount');
        $totalRevenue = $cycle->harvests()->sum('total_revenue');
        $profit = $totalRevenue - $totalCost;

        // Group expenses by category
        $expenseSummary = $cycle->expenses()
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();

        return response()->json([
            'data' => [
                'cycle' => $cycle,
                'feedings' => $cycle->feedings,
                'health_logs' => $cycle->healths,
                'harvests' => $cycle->harvests,
                'samplings' => [], // Add sampling model if exists
                'stats' => [
                    'total_cost' => $totalCost,
                    'total_revenue' => $totalRevenue,
                    'profit' => $profit,
                    'expense_summary' => $expenseSummary,
                    'current_population' => $cycle->seed_count - $cycle->healths()->sum('mortality_count'),
                    'survival_rate' => $cycle->seed_count > 0 ? round((($cycle->seed_count - $cycle->healths()->sum('mortality_count')) / $cycle->seed_count) * 100, 2) : 0,
                    'total_feed_kg' => $cycle->feedings()->sum('amount_kg'),
                    'fcr' => 0 // Add FCR logic if needed
                ]
            ]
        ]);
    }
}
