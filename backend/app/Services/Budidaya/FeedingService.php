<?php

namespace App\Services\Budidaya;

use App\Models\BudidayaCycle;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaInventory;
use App\Models\BudidayaExpense;
use Illuminate\Support\Facades\DB;
use Exception;

class FeedingService
{
    /**
     * Record feeding activity and automatically deduct inventory stock.
     */
    public function recordFeeding(BudidayaCycle $cycle, array $data)
    {
        if ($cycle->status === 'panen') {
            throw new Exception('Siklus sudah selesai (panen). Tidak dapat menambah data pakan.');
        }

        $inventory = BudidayaInventory::findOrFail($data['inventory_id']);

        if (strtolower($inventory->category) !== 'pakan') {
            throw new Exception('Barang yang dipilih bukan pakan.');
        }

        if ($inventory->stock < $data['amount_kg']) {
            throw new Exception('Stok pakan tidak mencukupi. Sisa stok: ' . $inventory->stock . ' ' . $inventory->unit);
        }

        return DB::transaction(function () use ($cycle, $data, $inventory) {
            // 1. Record Feeding
            $feeding = BudidayaFeeding::create([
                'cycle_id' => $cycle->id,
                'inventory_id' => $inventory->id,
                'amount_kg' => $data['amount_kg'],
                'date' => $data['date'],
                'notes' => $data['notes'] ?? null,
            ]);

            // 2. Deduct Inventory Stock Atomically
            $inventory->decrement('stock', $data['amount_kg']);
            
            // 3. Log Inventory Outflow
            $inventory->logs()->create([
                'type' => 'out',
                'quantity' => $data['amount_kg'],
                'note' => 'Pemberian pakan Kolam: ' . ($cycle->pond->name ?? 'Unknown'),
                'transaction_date' => $data['date'],
            ]);

            // 4. Record Expense (Optional based on business rules, but keeping existing logic)
            if ($inventory->price_per_unit > 0) {
                $totalCost = $data['amount_kg'] * $inventory->price_per_unit;
                BudidayaExpense::create([
                    // tenant_id will be auto-filled by HasTenant trait
                    'cycle_id' => $cycle->id,
                    'category' => 'pakan',
                    'amount' => $totalCost,
                    'date' => $data['date'],
                    'notes' => 'Biaya pakan ' . $data['amount_kg'] . ' kg ' . $inventory->name,
                ]);
            }

            return $feeding;
        });
    }
}
