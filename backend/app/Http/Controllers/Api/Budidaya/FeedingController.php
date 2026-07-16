<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaInventory;
use App\Models\BudidayaExpense;
use App\Services\Budidaya\FeedingService;
use App\Services\Budidaya\UnitConversionService;
use Illuminate\Support\Facades\DB;
use Exception;

class FeedingController extends Controller
{
    protected $feedingService;
    protected $unitConversionService;

    public function __construct(FeedingService $feedingService, UnitConversionService $unitConversionService)
    {
        $this->feedingService = $feedingService;
        $this->unitConversionService = $unitConversionService;
    }

    public function store(Request $request, $cycleId)
    {
        if (!$request->has('amount') && $request->has('amount_kg')) {
            $request->merge(['amount' => $request->input('amount_kg')]);
        }

        $cycle = BudidayaCycle::findOrFail($cycleId);

        $validated = $request->validate([
            'inventory_id' => 'required|exists:budidaya_inventories,id',
            'amount' => 'required|numeric|min:0.01',
            'unit' => 'nullable|string|max:50',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        try {
            $inputUnit = $validated['unit'] ?? 'kg';
            $amountKg = $this->unitConversionService->convertToStandardUnit($validated['amount'], $inputUnit);
            
            $feedingData = [
                'inventory_id' => $validated['inventory_id'],
                'amount_kg' => $amountKg,
                'date' => $validated['date'],
                'notes' => $validated['notes'],
                'original_input' => $validated['amount'] . ' ' . $inputUnit
            ];

            $this->feedingService->recordFeeding($cycle, $feedingData);
            return response()->json(['message' => 'Pemberian pakan berhasil dicatat']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'inventory_id' => 'required|exists:budidaya_inventories,id',
            'amount_kg' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $feeding = BudidayaFeeding::findOrFail($id);
        $cycle = $feeding->cycle;

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat mengubah data pakan.'], 400);
        }

        try {
            DB::transaction(function () use ($feeding, $validated) {
                $oldInventory = $feeding->inventory;
                $newInventory = BudidayaInventory::findOrFail($validated['inventory_id']);

                // Restore old stock
                if ($oldInventory) {
                    $oldInventory->increment('stock', $feeding->amount_kg);
                }

                // Check new stock
                if ($newInventory->stock < $validated['amount_kg']) {
                    throw new Exception('Stok pakan tidak mencukupi. Sisa stok: ' . $newInventory->stock . ' ' . $newInventory->unit);
                }

                // Deduct new stock
                $newInventory->decrement('stock', $validated['amount_kg']);

                // Update feeding
                $oldAmount = $feeding->amount_kg;
                $oldDate = $feeding->date;
                $feeding->update([
                    'inventory_id' => $validated['inventory_id'],
                    'amount_kg' => $validated['amount_kg'],
                    'date' => $validated['date'],
                    'notes' => $validated['notes'],
                ]);

                // Update expense if any
                $oldCost = $oldAmount * ($oldInventory ? $oldInventory->price_per_unit : 0);
                $newCost = $validated['amount_kg'] * ($newInventory->price_per_unit ?? 0);

                if ($oldCost > 0) {
                    $expense = BudidayaExpense::where('cycle_id', $feeding->cycle_id)
                        ->where('category', 'pakan')
                        ->where('amount', $oldCost)
                        ->where('date', $oldDate)
                        ->first();
                    if ($expense) {
                        if ($newCost > 0) {
                            $expense->update([
                                'amount' => $newCost,
                                'date' => $validated['date'],
                                'notes' => 'Biaya pakan ' . $validated['amount_kg'] . ' kg ' . $newInventory->name,
                            ]);
                        } else {
                            $expense->delete();
                        }
                    }
                } elseif ($newCost > 0) {
                    BudidayaExpense::create([
                        'cycle_id' => $feeding->cycle_id,
                        'category' => 'pakan',
                        'amount' => $newCost,
                        'date' => $validated['date'],
                        'notes' => 'Biaya pakan ' . $validated['amount_kg'] . ' kg ' . $newInventory->name,
                    ]);
                }
            });
            return response()->json(['message' => 'Pemberian pakan berhasil diperbarui']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy($id)
    {
        $feeding = BudidayaFeeding::findOrFail($id);
        $cycle = $feeding->cycle;

        if ($cycle->status === 'panen') {
            return response()->json(['message' => 'Siklus sudah selesai (panen). Tidak dapat menghapus data pakan.'], 400);
        }

        try {
            DB::transaction(function () use ($feeding) {
                $inventory = $feeding->inventory;
                if ($inventory) {
                    $inventory->increment('stock', $feeding->amount_kg);
                }

                // Delete expense if any
                $cost = $feeding->amount_kg * ($inventory ? $inventory->price_per_unit : 0);
                if ($cost > 0) {
                    $expense = BudidayaExpense::where('cycle_id', $feeding->cycle_id)
                        ->where('category', 'pakan')
                        ->where('amount', $cost)
                        ->where('date', $feeding->date)
                        ->first();
                    if ($expense) {
                        $expense->delete();
                    }
                }

                $feeding->delete();
            });
            return response()->json(['message' => 'Pemberian pakan berhasil dihapus']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
