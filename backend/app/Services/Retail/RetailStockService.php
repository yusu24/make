<?php

namespace App\Services\Retail;

use App\Models\Notification;
use App\Models\RetailProduct;
use App\Models\RetailStockMovement;
use Illuminate\Database\Eloquent\Model;

class RetailStockService
{
    public function deduct(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);

        if ($product->stock < $quantity) {
            throw new \RuntimeException("Stok produk '{$product->name}' tidak mencukupi. Tersedia: {$product->stock}, diminta: {$quantity}.");
        }

        $before = $product->stock;
        $after = $before - $quantity;
        $product->update(['stock' => $after]);

        $this->writeMovement($product, 'out', -$quantity, $before, $after, $reference, $note);
        $this->maybeNotifyLowStock($product);
    }

    public function restore(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);

        $before = $product->stock;
        $after = $before + $quantity;
        $product->update(['stock' => $after]);

        $this->writeMovement($product, 'void', $quantity, $before, $after, $reference, $note);
    }

    public function addStock(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);

        $before = $product->stock;
        $after = $before + $quantity;
        $product->update(['stock' => $after]);

        $this->writeMovement($product, 'in', $quantity, $before, $after, $reference, $note);
    }

    public function adjustStock(RetailProduct $product, float $newQuantity, ?Model $reference = null, ?string $note = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);

        $before = $product->stock;
        $delta = $newQuantity - $before;
        $product->update(['stock' => $newQuantity]);

        $this->writeMovement($product, 'adjustment', $delta, $before, $newQuantity, $reference, $note);
        $this->maybeNotifyLowStock($product);
    }

    public function supplierReturn(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);

        if ($product->stock < $quantity) {
            throw new \RuntimeException("Stok produk '{$product->name}' tidak mencukupi untuk retur ke supplier.");
        }

        $before = $product->stock;
        $after = $before - $quantity;
        $product->update(['stock' => $after]);

        $this->writeMovement($product, 'return_supplier', -$quantity, $before, $after, $reference, $note);
        $this->maybeNotifyLowStock($product);
    }

    public function customerReturn(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);

        $before = $product->stock;
        $after = $before + $quantity;
        $product->update(['stock' => $after]);

        $this->writeMovement($product, 'return_customer', $quantity, $before, $after, $reference, $note);
    }

    private function writeMovement(RetailProduct $product, string $type, float $quantity, float $before, float $after, ?Model $reference, ?string $note): void
    {
        RetailStockMovement::create([
            'tenant_id' => $product->tenant_id,
            'product_id' => $product->id,
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

    private function maybeNotifyLowStock(RetailProduct $product): void
    {
        $product->refresh();
        if ($product->stock > ($product->stock_min ?? 0)) {
            return;
        }

        Notification::create([
            'user_id' => auth()->id(),
            'tenant_id' => $product->tenant_id,
            'type' => 'warning',
            'title' => 'Stok Menipis! ⚠️',
            'message' => "Stok produk '{$product->name}' tersisa {$product->stock}. Segera lakukan pemesanan ulang.",
            'data' => ['link' => '/retail/inventory', 'product_id' => $product->id],
        ]);
    }
}
