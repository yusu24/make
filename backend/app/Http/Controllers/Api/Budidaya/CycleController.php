<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaExpense;
use App\Models\BudidayaInventory;
use App\Models\BudidayaSampling;
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
        $pond = BudidayaPond::findOrFail($pondId);
        
        $activeCycle = $pond->activeCycle()->with(['feedings.inventory', 'healths', 'expenses', 'samplings', 'harvests'])->first();

        if (!$activeCycle) {
            // Load the most recent completed cycle so they can view logs and edit harvests if finished!
            $activeCycle = $pond->cycles()->where('status', 'panen')->orderBy('updated_at', 'desc')->with(['feedings.inventory', 'healths', 'expenses', 'samplings', 'harvests'])->first();
        }

        if (!$activeCycle) {
            return response()->json(['data' => null, 'message' => 'Tidak ada siklus']);
        }

        // Calculate age
        $ageDays = (int) now()->diffInDays($activeCycle->seed_date, true);

        // Calculate totals
        $totalFeedCost = $activeCycle->expenses()->where('category', 'pakan')->sum('amount');
        $totalSeedCost = $activeCycle->expenses()->where('category', 'benih')->sum('amount');
        $totalFeedKg = $activeCycle->feedings()->sum('amount_kg');

        // Latest sampling for current weight estimate
        $latestSampling = $activeCycle->samplings()->orderBy('date', 'desc')->first();

        return response()->json([
            'data' => [
                'cycle' => $activeCycle,
                'age_days' => $ageDays,
                'latest_weight_gram' => $latestSampling ? $latestSampling->average_weight_gram : null,
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
        // TenantScope is automatically applied via HasTenant trait
        $pond = BudidayaPond::findOrFail($pondId);
        $tenantId = $pond->tenant_id;

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

            // 2. Update pond status to aktif
            $pond->update(['status' => 'aktif']);

            // 3. Handle Inventory if applicable
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

            // 4. Record Expense
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
        $query = BudidayaCycle::with(['pond', 'feedings.inventory', 'healths', 'harvests', 'expenses', 'samplings']);
        
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

        // Feedings sorted newest first, with inventory name resolved
        $feedingsSorted = $cycle->feedings->sortByDesc('date')->map(function ($f) {
            return [
                'id'          => $f->id,
                'date'        => $f->date,
                'amount_kg'   => $f->amount_kg,
                'notes'       => $f->notes,
                'created_at'  => $f->created_at,
                'feed_name'   => $f->inventory?->name ?? $f->feed_name ?? 'Pakan',
                'inventory_id'=> $f->inventory_id,
            ];
        })->values();

        // Total harvest weight for FCR calculation
        $totalHarvestKg = $cycle->harvests()->sum('total_weight_kg');
        $totalFeedKg    = $cycle->feedings()->sum('amount_kg');
        $fcr = ($totalHarvestKg > 0) ? round($totalFeedKg / $totalHarvestKg, 2) : 0;

        return response()->json([
            'data' => [
                'cycle'       => $cycle,
                'feedings'    => $feedingsSorted,
                'health_logs' => $cycle->healths,
                'harvests'    => $cycle->harvests,
                'samplings'   => $cycle->samplings->sortBy('date')->values(),
                'stats' => [
                    'total_cost'         => $totalCost,
                    'total_revenue'      => $totalRevenue,
                    'profit'             => $profit,
                    'expense_summary'    => $expenseSummary,
                    'current_population' => $cycle->seed_count - $cycle->healths()->sum('mortality_count'),
                    'survival_rate'      => $cycle->seed_count > 0
                        ? round((($cycle->seed_count - $cycle->healths()->sum('mortality_count')) / $cycle->seed_count) * 100, 2)
                        : 0,
                    'total_feed_kg'      => $totalFeedKg,
                    'fcr'                => $fcr,
                ]
            ]
        ]);
    }

    public function logSampling(Request $request)
    {
        $validated = $request->validate([
            'cycle_id'             => 'required|integer|exists:budidaya_cycles,id',
            'average_weight_gram'  => 'required|numeric|min:0.1',
            'sample_count'         => 'nullable|integer|min:1',
            'estimated_biomass_kg' => 'nullable|numeric|min:0',
            'date'                 => 'required|date',
            'notes'                => 'nullable|string|max:500',
        ]);

        // Verify the cycle belongs to the authenticated tenant
        $tenantId = $request->user()->tenant_id;
        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($validated['cycle_id']);

        // Auto-calculate estimated biomass if not provided
        if (empty($validated['estimated_biomass_kg']) && $cycle->seed_count > 0) {
            $currentPop = $cycle->seed_count - $cycle->healths()->sum('mortality_count');
            $validated['estimated_biomass_kg'] = round(($validated['average_weight_gram'] / 1000) * $currentPop, 2);
        }

        $sampling = BudidayaSampling::create($validated);

        return response()->json([
            'message' => 'Data sampling berhasil dicatat',
            'data'    => $sampling,
        ], 201);
    }

    public function updateSampling(Request $request, $id)
    {
        $validated = $request->validate([
            'average_weight_gram'  => 'required|numeric|min:0.1',
            'sample_count'         => 'nullable|integer|min:1',
            'estimated_biomass_kg' => 'nullable|numeric|min:0',
            'date'                 => 'required|date',
            'notes'                => 'nullable|string|max:500',
        ]);

        $sampling = BudidayaSampling::findOrFail($id);
        $cycle = $sampling->cycle;

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat mengubah data sampling.'], 400);
        }

        if (empty($validated['estimated_biomass_kg']) && $cycle->seed_count > 0) {
            $currentPop = $cycle->seed_count - $cycle->healths()->sum('mortality_count');
            $validated['estimated_biomass_kg'] = round(($validated['average_weight_gram'] / 1000) * $currentPop, 2);
        }

        $sampling->update($validated);

        return response()->json(['message' => 'Data sampling berhasil diperbarui', 'data' => $sampling]);
    }

    public function deleteSampling($id)
    {
        $sampling = BudidayaSampling::findOrFail($id);
        $cycle = $sampling->cycle;

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat menghapus data sampling.'], 400);
        }

        $sampling->delete();

        return response()->json(['message' => 'Data sampling berhasil dihapus']);
    }

    public function movePond(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $request->validate([
            'new_pond_id' => 'required|exists:budidaya_ponds,id',
        ]);

        $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($id);
        $oldPond = $cycle->pond;
        $newPond = BudidayaPond::where('tenant_id', $tenantId)->findOrFail($request->new_pond_id);

        if ($newPond->activeCycle) {
            return response()->json(['message' => 'Kolam tujuan masih memiliki siklus aktif'], 400);
        }

        return DB::transaction(function () use ($cycle, $oldPond, $newPond) {
            // Update cycle
            $cycle->update(['pond_id' => $newPond->id]);

            // Update old pond status to kosong
            if ($oldPond) {
                $oldPond->update(['status' => 'kosong']);
            }

            // Update new pond status to aktif
            $newPond->update(['status' => 'aktif']);

            return response()->json([
                'message' => 'Siklus berhasil dipindahkan',
                'data' => $cycle->load('pond')
            ]);
        });
    }
}
