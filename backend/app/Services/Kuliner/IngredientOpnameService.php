<?php

namespace App\Services\Kuliner;

use App\Models\KulinerIngredient;
use App\Models\KulinerIngredientOpname;
use App\Models\KulinerIngredientOpnameItem;
use Illuminate\Support\Facades\DB;

class IngredientOpnameService
{
    public function __construct(private IngredientStockService $stock)
    {
    }

    public function start(?string $note = null): KulinerIngredientOpname
    {
        if (KulinerIngredientOpname::where('status', 'draft')->exists()) {
            throw new \RuntimeException('Sudah ada stock opname draft yang belum diselesaikan.');
        }

        return DB::transaction(function () use ($note) {
            $opname = KulinerIngredientOpname::create([
                'status' => 'draft',
                'note' => $note,
                'user_id' => auth()->id(),
            ]);

            $ingredients = KulinerIngredient::all();
            $now = now();
            $rows = $ingredients->map(fn ($ing) => [
                'opname_id' => $opname->id,
                'ingredient_id' => $ing->id,
                'system_qty' => $ing->stock,
                'physical_qty' => $ing->stock,
                'difference' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if ($rows !== []) {
                KulinerIngredientOpnameItem::insert($rows);
            }

            return $opname->load('items.ingredient');
        });
    }

    public function updateCounts(KulinerIngredientOpname $opname, array $items): KulinerIngredientOpname
    {
        if ($opname->status !== 'draft') {
            throw new \RuntimeException('Stock opname yang sudah diajukan/disetujui tidak dapat diubah.');
        }

        foreach ($items as $item) {
            $opnameItem = $opname->items()->where('ingredient_id', $item['ingredient_id'])->first();
            if (!$opnameItem) {
                continue;
            }
            $physical = (float) $item['physical_qty'];
            $opnameItem->update([
                'physical_qty' => $physical,
                'difference' => $physical - $opnameItem->system_qty,
            ]);
        }

        return $opname->load('items.ingredient');
    }

    public function submitForApproval(KulinerIngredientOpname $opname): KulinerIngredientOpname
    {
        if ($opname->status !== 'draft') {
            throw new \RuntimeException('Stock opname ini sudah diajukan sebelumnya.');
        }

        $opname->update(['status' => 'pending_approval']);

        return $opname->fresh();
    }

    public function approve(KulinerIngredientOpname $opname): KulinerIngredientOpname
    {
        return DB::transaction(function () use ($opname) {
            $opname = KulinerIngredientOpname::lockForUpdate()->findOrFail($opname->id);

            if ($opname->status !== 'pending_approval') {
                throw new \RuntimeException('Stock opname ini tidak sedang menunggu persetujuan.');
            }

            foreach ($opname->items as $item) {
                if (abs($item->difference) > 0.0001 && $item->ingredient) {
                    $this->stock->adjustStock(
                        $item->ingredient,
                        $item->physical_qty,
                        $opname,
                        "Stock opname #{$opname->id} (selisih: {$item->difference})"
                    );
                }
            }

            $opname->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            return $opname->load('items.ingredient');
        });
    }

    public function reject(KulinerIngredientOpname $opname, ?string $note = null): KulinerIngredientOpname
    {
        if ($opname->status !== 'pending_approval') {
            throw new \RuntimeException('Stock opname ini tidak sedang menunggu persetujuan.');
        }

        $opname->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'note' => $note ?? $opname->note,
        ]);

        return $opname->fresh();
    }
}
