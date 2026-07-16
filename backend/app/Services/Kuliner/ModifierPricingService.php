<?php

namespace App\Services\Kuliner;

use App\Models\KulinerProduct;

class ModifierPricingService
{
    /**
     * Validate a product's modifier/add-on selection and compute the resulting unit price
     * plus JSON-ready snapshot arrays to persist onto the OrderItem.
     *
     * $modifierSelections: [option_id, ...] (one per selected option, across any number of groups)
     * $addonSelections: [['addon_id' => int, 'qty' => int], ...]
     *
     * @throws \RuntimeException when a required modifier group has no selection, or a
     *         selected option/addon does not belong to this product.
     */
    public function priceForSelection(KulinerProduct $product, array $modifierSelections, array $addonSelections): array
    {
        $product->loadMissing('modifierGroups.options', 'addons');

        $priceDelta = 0.0;
        $modifiersSnapshot = [];
        $selectedOptionIds = collect($modifierSelections)->map(fn ($id) => (int) $id);

        foreach ($product->modifierGroups as $group) {
            $groupOptionIds = $group->options->pluck('id');
            $selectedInGroup = $group->options->whereIn('id', $selectedOptionIds->intersect($groupOptionIds));

            if ($group->is_required && $selectedInGroup->isEmpty()) {
                throw new \RuntimeException("Modifier '{$group->name}' wajib dipilih.");
            }

            foreach ($selectedInGroup as $option) {
                $priceDelta += (float) $option->price_delta;
                $modifiersSnapshot[] = [
                    'group_id' => $group->id,
                    'group_name' => $group->name,
                    'option_id' => $option->id,
                    'option_name' => $option->name,
                    'price_delta' => (float) $option->price_delta,
                ];
            }
        }

        $addonsSnapshot = [];
        $productAddonIds = $product->addons->pluck('id');

        foreach ($addonSelections as $selection) {
            $addonId = (int) ($selection['addon_id'] ?? 0);
            $qty = max(1, (int) ($selection['qty'] ?? 1));

            if (!$productAddonIds->contains($addonId)) {
                throw new \RuntimeException("Add-on tidak tersedia untuk produk ini.");
            }

            $addon = $product->addons->firstWhere('id', $addonId);
            $priceDelta += (float) $addon->price * $qty;
            $addonsSnapshot[] = [
                'addon_id' => $addon->id,
                'name' => $addon->name,
                'price' => (float) $addon->price,
                'qty' => $qty,
            ];
        }

        $basePrice = (float) ($product->discount_price ?: $product->price);

        return [
            'unit_price' => $basePrice + $priceDelta,
            'modifiers_snapshot' => $modifiersSnapshot,
            'addons_snapshot' => $addonsSnapshot,
        ];
    }
}
