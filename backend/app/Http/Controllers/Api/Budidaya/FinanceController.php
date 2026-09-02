<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaExpense;
use App\Models\BudidayaIncome;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class FinanceController extends Controller
{
    private function ensureIncomesTableExists()
    {
        if (!Schema::hasTable('budidaya_incomes')) {
            Schema::create('budidaya_incomes', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 32)->index();
                $table->foreignId('cycle_id')->nullable()->constrained('budidaya_cycles')->onDelete('set null');
                $table->string('category', 100)->default('Penjualan Hasil Panen');
                $table->decimal('amount', 15, 2);
                $table->date('date');
                $table->string('payment_method', 50)->nullable()->default('Tunai / Kas');
                $table->string('recipient_or_buyer', 150)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

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

    // ─── INCOMES (PEMASUKAN KAS BUDIDAYA) ───────────────────────────────────

    public function indexIncomes(Request $request)
    {
        $this->ensureIncomesTableExists();
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cycleId = $request->query('cycle_id');

        $incomeQuery = BudidayaIncome::where('tenant_id', $tenantId)->with(['cycle.pond'])->orderBy('date', 'desc');
        $harvestQuery = BudidayaHarvest::whereHas('cycle', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('total_revenue', '>', 0)->with(['cycle.pond'])->orderBy('harvest_date', 'desc');

        if ($cycleId) {
            $incomeQuery->where('cycle_id', $cycleId);
            $harvestQuery->where('cycle_id', $cycleId);
        }

        $incomes = $incomeQuery->get()->map(function ($i) {
            return [
                'id' => $i->id,
                'source' => 'manual_income',
                'category' => $i->category,
                'amount' => (float) $i->amount,
                'date' => $i->date,
                'cycle_id' => $i->cycle_id,
                'cycle' => $i->cycle,
                'payment_method' => $i->payment_method ?? 'Tunai / Kas',
                'recipient_or_buyer' => $i->recipient_or_buyer,
                'notes' => $i->notes,
                'is_harvest' => false,
            ];
        });

        $harvestIncomes = $harvestQuery->get()->map(function ($h) {
            $weightInfo = $h->total_weight_kg ? number_format($h->total_weight_kg, 1, ',', '.') . ' kg' : ($h->total_count ? $h->total_count . ' ekor' : '');
            return [
                'id' => 'har_' . $h->id,
                'harvest_id' => $h->id,
                'source' => 'harvest',
                'category' => 'Penjualan Hasil Panen',
                'amount' => (float) $h->total_revenue,
                'date' => $h->harvest_date,
                'cycle_id' => $h->cycle_id,
                'cycle' => $h->cycle,
                'payment_method' => 'Pelunasan Panen',
                'recipient_or_buyer' => 'Pengepul / Pembeli Panen',
                'notes' => 'Hasil Panen: ' . ($h->cycle->pond->name ?? 'Kolam') . ($weightInfo ? " ($weightInfo)" : '') . ($h->notes ? ' - ' . $h->notes : ''),
                'is_harvest' => true,
            ];
        });

        $allIncomes = $incomes->concat($harvestIncomes)->sortByDesc('date')->values();

        return response()->json(['data' => $allIncomes]);
    }

    public function storeIncome(Request $request)
    {
        $this->ensureIncomesTableExists();
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'cycle_id' => 'nullable|exists:budidaya_cycles,id',
            'payment_method' => 'nullable|string',
            'recipient_or_buyer' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($request->cycle_id) {
            $cycle = BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($request->cycle_id);
        }

        $income = BudidayaIncome::create([
            'tenant_id' => $tenantId,
            'cycle_id' => $request->cycle_id,
            'category' => $request->category,
            'amount' => $request->amount,
            'date' => $request->date,
            'payment_method' => $request->payment_method ?: 'Tunai / Kas',
            'recipient_or_buyer' => $request->recipient_or_buyer ?: 'Pembeli / Pengepul',
            'notes' => $request->notes
        ]);

        return response()->json(['message' => 'Pemasukan kas dicatat', 'data' => $income], 201);
    }

    public function updateIncome(Request $request, $id)
    {
        $this->ensureIncomesTableExists();
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        if (str_starts_with((string)$id, 'har_')) {
            return response()->json(['message' => 'Catatan panen otomatis disinkronkan dari data panen siklus.'], 400);
        }

        $income = BudidayaIncome::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'payment_method' => 'nullable|string',
            'recipient_or_buyer' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $income->update([
            'category' => $request->category,
            'amount' => $request->amount,
            'date' => $request->date,
            'payment_method' => $request->payment_method ?: $income->payment_method,
            'recipient_or_buyer' => $request->recipient_or_buyer ?: $income->recipient_or_buyer,
            'notes' => $request->notes
        ]);

        return response()->json(['message' => 'Pemasukan kas berhasil diperbarui', 'data' => $income]);
    }

    public function destroyIncome(Request $request, $id)
    {
        $this->ensureIncomesTableExists();
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        if (str_starts_with((string)$id, 'har_')) {
            $harvestId = str_replace('har_', '', $id);
            $harvest = BudidayaHarvest::whereHas('cycle', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })->findOrFail($harvestId);
            $harvest->delete();
            return response()->json(['message' => 'Catatan panen berhasil dihapus']);
        }

        $income = BudidayaIncome::where('tenant_id', $tenantId)->findOrFail($id);
        
        $income->delete();
        return response()->json(['message' => 'Catatan pemasukan dihapus']);
    }

    // ─── FINANCE SUMMARY & LEDGER ──────────────────────────────────────────

    public function getSummary(Request $request)
    {
        $this->ensureIncomesTableExists();
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $harvestQuery = BudidayaHarvest::whereHas('cycle', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        });
        
        $incomeQuery = BudidayaIncome::where('tenant_id', $tenantId);
        $expenseQuery = BudidayaExpense::where('tenant_id', $tenantId);

        if ($startDate && $endDate) {
            $harvestQuery->whereBetween('harvest_date', [$startDate, $endDate]);
            $incomeQuery->whereBetween('date', [$startDate, $endDate]);
            $expenseQuery->whereBetween('date', [$startDate, $endDate]);
        }

        $totalHarvestSales = $harvestQuery->sum('total_revenue');
        $totalOtherIncomes = $incomeQuery->sum('amount');
        $totalSales = $totalHarvestSales + $totalOtherIncomes;
        $totalExpenses = $expenseQuery->sum('amount');

        return response()->json([
            'total_harvest_sales' => $totalHarvestSales,
            'total_other_incomes' => $totalOtherIncomes,
            'total_sales' => $totalSales,
            'total_expenses' => $totalExpenses,
            'profit' => $totalSales - $totalExpenses
        ]);
    }

    public function getLedger(Request $request)
    {
        $this->ensureIncomesTableExists();
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $harvestQuery = BudidayaHarvest::whereHas('cycle', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->with(['cycle.pond']);

        $incomeQuery = BudidayaIncome::where('tenant_id', $tenantId)->with(['cycle.pond']);
        $expenseQuery = BudidayaExpense::where('tenant_id', $tenantId)->with(['cycle.pond']);

        if ($startDate && $endDate) {
            $harvestQuery->whereBetween('harvest_date', [$startDate, $endDate]);
            $incomeQuery->whereBetween('date', [$startDate, $endDate]);
            $expenseQuery->whereBetween('date', [$startDate, $endDate]);
        } else {
            $harvestQuery->limit(500);
            $incomeQuery->limit(500);
            $expenseQuery->limit(500);
        }

        $harvests = $harvestQuery->orderBy('harvest_date', 'desc')->get()->map(function ($h) {
            return [
                'id' => 'HAR-' . $h->id,
                'original_id' => $h->id,
                'type' => 'income',
                'date' => $h->harvest_date,
                'category' => 'Penjualan Panen',
                'description' => 'Panen: ' . ($h->cycle->pond->name ?? 'N/A') . ($h->notes ? ' - ' . $h->notes : ''),
                'amount' => $h->total_revenue,
                'status' => 'completed',
                'raw_data' => $h
            ];
        });

        $otherIncomes = $incomeQuery->orderBy('date', 'desc')->get()->map(function ($inc) {
            $pondName = $inc->cycle ? ($inc->cycle->pond->name ?? 'N/A') : 'Umum';
            return [
                'id' => 'INC-' . $inc->id,
                'original_id' => $inc->id,
                'type' => 'income',
                'date' => $inc->date,
                'category' => $inc->category,
                'description' => $inc->notes ? $inc->notes . " ($pondName)" : "Pemasukan ($pondName)",
                'amount' => $inc->amount,
                'status' => 'completed',
                'raw_data' => $inc
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

        $ledger = $harvests->concat($otherIncomes)->concat($expenses)->sortByDesc('date')->values();
        
        return response()->json($ledger);
    }
}

