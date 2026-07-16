<?php

namespace App\Services\Kuliner;

use App\Models\KulinerIngredient;
use App\Models\KulinerWaste;
use Illuminate\Support\Facades\DB;

class WasteService
{
    public function __construct(private IngredientStockService $stock)
    {
    }

    public function recordWaste(KulinerIngredient $ingredient, float $quantity, string $reason, string $wasteDate, ?string $note = null): KulinerWaste
    {
        return DB::transaction(function () use ($ingredient, $quantity, $reason, $wasteDate, $note) {
            $valueLost = $quantity * (float) $ingredient->last_price;

            $waste = KulinerWaste::create([
                'tenant_id' => $ingredient->tenant_id,
                'ingredient_id' => $ingredient->id,
                'quantity' => $quantity,
                'reason' => $reason,
                'waste_date' => $wasteDate,
                'value_lost' => $valueLost,
                'note' => $note,
                'user_id' => auth()->id(),
            ]);

            $this->stock->deduct($ingredient, $quantity, $waste, "Waste: {$reason}" . ($note ? " — {$note}" : ''), 'void');

            return $waste;
        });
    }
}
