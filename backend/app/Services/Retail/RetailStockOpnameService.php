<?php

namespace App\Services\Retail;

use App\Models\RetailProduct;
use App\Models\RetailStockOpname;
use App\Models\RetailStockOpnameItem;
use Illuminate\Support\Facades\DB;

class RetailStockOpnameService
{
    public function __construct(private RetailStockService $stock)
    {
    }

    public function start(?string $note = null): RetailStockOpname
    {
        if (RetailStockOpname::where('status', 'draft')->exists()) {
            throw new \RuntimeException('Sudah ada stock opname draft yang belum diselesaikan.');
        }

        return DB::transaction(function () use ($note) {
            $opname = RetailStockOpname::create([
                'status' => 'draft',
                'note' => $note,
                'user_id' => auth()->id(),
            ]);

            $products = RetailProduct::select('id', 'stock')->get();
            $now = now();
            $rows = $products->map(fn ($product) => [
                'opname_id' => $opname->id,
                'product_id' => $product->id,
                'system_qty' => $product->stock,
                'physical_qty' => $product->stock,
                'difference' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if ($rows !== []) {
                RetailStockOpnameItem::insert($rows);
            }

            return $opname->load('items.product');
        });
    }

    public function updateCounts(RetailStockOpname $opname, array $items): RetailStockOpname
    {
        if ($opname->status === 'finalized') {
            throw new \RuntimeException('Stock opname yang sudah difinalisasi tidak dapat diubah.');
        }

        $opnameItems = $opname->items()->get()->keyBy('product_id');

        foreach ($items as $item) {
            $opnameItem = $opnameItems->get($item['product_id']);
            if (!$opnameItem) {
                continue;
            }
            $physical = (float) $item['physical_qty'];
            $opnameItem->update([
                'physical_qty' => $physical,
                'difference' => $physical - $opnameItem->system_qty,
            ]);
        }

        return $opname->load('items.product');
    }

    public function finalize(RetailStockOpname $opname): RetailStockOpname
    {
        return DB::transaction(function () use ($opname) {
            $opname = RetailStockOpname::lockForUpdate()->findOrFail($opname->id);

            if ($opname->status === 'finalized') {
                throw new \RuntimeException('Stock opname ini sudah difinalisasi.');
            }

            foreach ($opname->items as $item) {
                if (abs($item->difference) > 0.0001 && $item->product) {
                    $this->stock->adjustStock(
                        $item->product,
                        $item->physical_qty,
                        $opname,
                        "Stock opname #{$opname->id} (selisih: {$item->difference})"
                    );
                }
            }

            $opname->update(['status' => 'finalized', 'finalized_at' => now()]);
            return $opname->load('items.product');
        });
    }
}
