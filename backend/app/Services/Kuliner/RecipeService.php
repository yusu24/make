<?php

namespace App\Services\Kuliner;

use App\Models\KulinerBundle;
use App\Models\KulinerProduct;
use App\Models\KulinerRecipeItem;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class RecipeService
{
    public function __construct(private IngredientStockService $stock)
    {
    }

    /**
     * Replace-all sync of a product's recipe/BOM.
     * $items: [['ingredient_id' => int, 'quantity' => float, 'note' => ?string], ...]
     */
    public function syncRecipe(KulinerProduct $product, array $items): void
    {
        DB::transaction(function () use ($product, $items) {
            $keepIds = [];

            foreach ($items as $item) {
                $recipeItem = KulinerRecipeItem::updateOrCreate(
                    ['product_id' => $product->id, 'ingredient_id' => $item['ingredient_id']],
                    [
                        'tenant_id' => $product->tenant_id,
                        'quantity' => $item['quantity'],
                        'note' => $item['note'] ?? null,
                    ]
                );
                $keepIds[] = $recipeItem->id;
            }

            KulinerRecipeItem::where('product_id', $product->id)
                ->whereNotIn('id', $keepIds)
                ->delete();
        });
    }

    /**
     * Decrement ingredient stock for every recipe-bearing item on the order.
     * Safe no-op for order items with no kuliner_product_id or no configured recipe
     * (i.e. every order placed before this feature existed).
     */
    public function consumeForOrder(Order $order): void
    {
        $order->loadMissing('items.kulinerProduct.recipeItems.ingredient');

        foreach ($order->items as $orderItem) {
            $product = $orderItem->kulinerProduct;
            if (!$product) {
                continue;
            }

            foreach ($product->recipeItems as $recipeItem) {
                $ingredient = $recipeItem->ingredient;
                if (!$ingredient) {
                    continue;
                }

                $consumeQty = (float) $recipeItem->quantity * (float) $orderItem->qty;

                try {
                    $this->stock->deduct(
                        $ingredient,
                        $consumeQty,
                        $order,
                        "Order #{$order->order_number} - {$product->name}"
                    );
                } catch (\Throwable $e) {
                    // Insufficient stock must never block order completion (existing
                    // behavior stays unchanged) — just log it, admin sees the low-stock
                    // notification separately once stock goes negative/near zero.
                    report($e);
                }
            }
        }
    }

    /**
     * Expand one bundle line into N per-component order_items rows at placement time,
     * with bundle_price prorated across components (remainder on the last row).
     * Returns an array of row arrays ready for DB::table('order_items')->insert().
     */
    public function expandBundleForOrder(KulinerBundle $bundle, int $bundleQty): array
    {
        $bundle->loadMissing('items.product');
        $components = $bundle->items;

        $normalTotal = $components->sum(fn ($c) => (float) ($c->product->price ?? 0) * $c->quantity);
        $normalTotal = $normalTotal > 0 ? $normalTotal : 1;

        $rows = [];
        $allocated = 0.0;
        $count = $components->count();

        foreach ($components as $index => $component) {
            $product = $component->product;
            $qty = $component->quantity * $bundleQty;
            $weight = ((float) ($product->price ?? 0) * $component->quantity) / $normalTotal;

            if ($index === $count - 1) {
                $subtotal = round(($bundle->bundle_price * $bundleQty) - $allocated, 2);
            } else {
                $subtotal = round($bundle->bundle_price * $bundleQty * $weight, 2);
                $allocated += $subtotal;
            }

            $rows[] = [
                'product_id' => $product->id,
                'kuliner_product_id' => $product->id,
                'bundle_id' => $bundle->id,
                'name' => $product->name,
                'qty' => $qty,
                'price' => $qty > 0 ? round($subtotal / $qty, 2) : 0,
                'subtotal' => $subtotal,
            ];
        }

        return $rows;
    }
}
