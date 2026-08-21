<?php

namespace App\Services\Retail;

use App\Models\Notification;
use App\Models\RetailProduct;
use App\Models\RetailOutlet;
use App\Models\RetailProductStock;
use App\Models\RetailStockMovement;
use Illuminate\Database\Eloquent\Model;

class RetailStockService
{
    private function getOutletId($tenantId, $outletId = null)
    {
        if ($outletId) return $outletId;
        
        $primary = RetailOutlet::firstOrCreate(
            ['tenant_id' => $tenantId, 'is_primary' => true],
            ['name' => 'Pusat']
        );
        return $primary->id;
    }

    private function getStockRecord(RetailProduct $product, $outletId)
    {
        return RetailProductStock::lockForUpdate()->firstOrCreate(
            ['tenant_id' => $product->tenant_id, 'product_id' => $product->id, 'outlet_id' => $outletId],
            ['stock' => 0]
        );
    }

    private function syncTotalStock(RetailProduct $product)
    {
        $total = RetailProductStock::where('product_id', $product->id)->sum('stock');
        $product->update(['stock' => $total]);
        return $total;
    }

    public function deduct(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null, ?int $outletId = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);
        $outletId = $this->getOutletId($product->tenant_id, $outletId);
        $stockRecord = $this->getStockRecord($product, $outletId);

        if ($stockRecord->stock < $quantity) {
            throw new \RuntimeException("Stok produk '{$product->name}' di outlet ini tidak mencukupi. Tersedia: {$stockRecord->stock}, diminta: {$quantity}.");
        }

        $before = $stockRecord->stock;
        $after = $before - $quantity;
        $stockRecord->update(['stock' => $after]);
        
        $this->syncTotalStock($product);

        $this->writeMovement($product, $outletId, 'out', -$quantity, $before, $after, $reference, $note);
        $this->maybeNotifyLowStock($product, $stockRecord);
    }

    public function restore(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null, ?int $outletId = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);
        $outletId = $this->getOutletId($product->tenant_id, $outletId);
        $stockRecord = $this->getStockRecord($product, $outletId);

        $before = $stockRecord->stock;
        $after = $before + $quantity;
        $stockRecord->update(['stock' => $after]);

        $this->syncTotalStock($product);

        $this->writeMovement($product, $outletId, 'void', $quantity, $before, $after, $reference, $note);
    }

    public function addStock(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null, ?int $outletId = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);
        $outletId = $this->getOutletId($product->tenant_id, $outletId);
        $stockRecord = $this->getStockRecord($product, $outletId);

        $before = $stockRecord->stock;
        $after = $before + $quantity;
        $stockRecord->update(['stock' => $after]);

        $this->syncTotalStock($product);

        $this->writeMovement($product, $outletId, 'in', $quantity, $before, $after, $reference, $note);
    }

    public function adjustStock(RetailProduct $product, float $newQuantity, ?Model $reference = null, ?string $note = null, ?int $outletId = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);
        $outletId = $this->getOutletId($product->tenant_id, $outletId);
        $stockRecord = $this->getStockRecord($product, $outletId);

        $before = $stockRecord->stock;
        $delta = $newQuantity - $before;
        $stockRecord->update(['stock' => $newQuantity]);

        $this->syncTotalStock($product);

        $this->writeMovement($product, $outletId, 'adjustment', $delta, $before, $newQuantity, $reference, $note);
        $this->maybeNotifyLowStock($product, $stockRecord);
    }

    public function supplierReturn(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null, ?int $outletId = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);
        $outletId = $this->getOutletId($product->tenant_id, $outletId);
        $stockRecord = $this->getStockRecord($product, $outletId);

        if ($stockRecord->stock < $quantity) {
            throw new \RuntimeException("Stok produk '{$product->name}' tidak mencukupi untuk retur ke supplier.");
        }

        $before = $stockRecord->stock;
        $after = $before - $quantity;
        $stockRecord->update(['stock' => $after]);

        $this->syncTotalStock($product);

        $this->writeMovement($product, $outletId, 'return_supplier', -$quantity, $before, $after, $reference, $note);
        $this->maybeNotifyLowStock($product, $stockRecord);
    }

    public function customerReturn(RetailProduct $product, float $quantity, ?Model $reference = null, ?string $note = null, ?int $outletId = null): void
    {
        $product = RetailProduct::lockForUpdate()->findOrFail($product->id);
        $outletId = $this->getOutletId($product->tenant_id, $outletId);
        $stockRecord = $this->getStockRecord($product, $outletId);

        $before = $stockRecord->stock;
        $after = $before + $quantity;
        $stockRecord->update(['stock' => $after]);

        $this->syncTotalStock($product);

        $this->writeMovement($product, $outletId, 'return_customer', $quantity, $before, $after, $reference, $note);
    }

    private function writeMovement(RetailProduct $product, $outletId, string $type, float $quantity, float $before, float $after, ?Model $reference, ?string $note): void
    {
        // Currently RetailStockMovement doesn't have outlet_id, but it's fine.
        // We will just use the existing columns to not break migration.
        RetailStockMovement::create([
            'tenant_id' => $product->tenant_id,
            'product_id' => $product->id,
            'type' => $type,
            'quantity' => $quantity,
            'quantity_before' => $before,
            'quantity_after' => $after,
            'reference_type' => $reference ? $reference::class : null,
            'reference_id' => $reference?->id,
            'note' => ($note ? $note . " (Outlet ID: $outletId)" : "Outlet ID: $outletId"),
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);
    }

    private function maybeNotifyLowStock(RetailProduct $product, RetailProductStock $stockRecord): void
    {
        $product->refresh();
        if ($stockRecord->stock > ($product->stock_min ?? 0)) {
            return;
        }

        $recentlyNotified = Notification::where('tenant_id', $product->tenant_id)
            ->where('type', 'warning')
            ->where('data->product_id', $product->id)
            ->where('created_at', '>=', now()->subHours(6))
            ->exists();

        if ($recentlyNotified) {
            return;
        }

        Notification::create([
            'user_id' => auth()->id(),
            'tenant_id' => $product->tenant_id,
            'type' => 'warning',
            'title' => 'Stok Menipis! ⚠️',
            'message' => "Stok produk '{$product->name}' di outlet tersisa {$stockRecord->stock}. Segera lakukan pemesanan ulang.",
            'data' => ['link' => '/retail/inventory', 'product_id' => $product->id],
        ]);
    }
}
