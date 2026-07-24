<?php

namespace App\Services\Kuliner;

use App\Models\KulinerIngredient;
use App\Models\KulinerIngredientStockMovement;
use App\Models\Notification;
use Illuminate\Database\Eloquent\Model;

class IngredientStockService
{
    public function deduct(KulinerIngredient $ingredient, float $quantity, ?Model $reference = null, ?string $note = null, string $type = 'out'): void
    {
        $ingredient = KulinerIngredient::lockForUpdate()->findOrFail($ingredient->id);

        $before = (float) $ingredient->stock;
        $after = $before - $quantity;
        $ingredient->update(['stock' => $after]);

        $this->writeMovement($ingredient, $type, -$quantity, $before, $after, $reference, $note);
        $this->maybeNotifyLowStock($ingredient);
    }

    public function restore(KulinerIngredient $ingredient, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $ingredient = KulinerIngredient::lockForUpdate()->findOrFail($ingredient->id);

        $before = (float) $ingredient->stock;
        $after = $before + $quantity;
        $ingredient->update(['stock' => $after]);

        $this->writeMovement($ingredient, 'void', $quantity, $before, $after, $reference, $note);
    }

    public function addStock(KulinerIngredient $ingredient, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $ingredient = KulinerIngredient::lockForUpdate()->findOrFail($ingredient->id);

        $before = (float) $ingredient->stock;
        $after = $before + $quantity;
        $ingredient->update(['stock' => $after]);

        $this->writeMovement($ingredient, 'in', $quantity, $before, $after, $reference, $note);
    }

    public function adjustStock(KulinerIngredient $ingredient, float $newQuantity, ?Model $reference = null, ?string $note = null): void
    {
        $ingredient = KulinerIngredient::lockForUpdate()->findOrFail($ingredient->id);

        $before = (float) $ingredient->stock;
        $delta = $newQuantity - $before;
        $ingredient->update(['stock' => $newQuantity]);

        $this->writeMovement($ingredient, 'adjustment', $delta, $before, $newQuantity, $reference, $note);
        $this->maybeNotifyLowStock($ingredient);
    }

    private function writeMovement(KulinerIngredient $ingredient, string $type, float $quantity, float $before, float $after, ?Model $reference, ?string $note): void
    {
        KulinerIngredientStockMovement::create([
            'tenant_id' => $ingredient->tenant_id,
            'ingredient_id' => $ingredient->id,
            'type' => $type,
            'quantity' => $quantity,
            'quantity_before' => $before,
            'quantity_after' => $after,
            'reference_type' => $reference ? $reference::class : null,
            'reference_id' => $reference?->id,
            'note' => $note,
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);
    }

    private function maybeNotifyLowStock(KulinerIngredient $ingredient): void
    {
        $ingredient->refresh();
        if ((float) $ingredient->stock > (float) $ingredient->min_stock) {
            return;
        }

        // Avoid spamming a "stok menipis" notification every time an
        // already-low ingredient is consumed again — one alert per
        // ingredient is enough within a cooldown window.
        $recentlyNotified = Notification::where('tenant_id', $ingredient->tenant_id)
            ->where('type', 'warning')
            ->where('data->ingredient_id', $ingredient->id)
            ->where('created_at', '>=', now()->subHours(6))
            ->exists();

        if ($recentlyNotified) {
            return;
        }

        Notification::create([
            'user_id' => auth()->id(),
            'tenant_id' => $ingredient->tenant_id,
            'type' => 'warning',
            'title' => 'Stok Bahan Baku Menipis! ⚠️',
            'message' => "Stok '{$ingredient->name}' tersisa {$ingredient->stock} {$ingredient->unit}. Segera lakukan pemesanan ulang.",
            'data' => ['link' => '/kuliner/admin/ingredients', 'ingredient_id' => $ingredient->id],
        ]);
    }
}
