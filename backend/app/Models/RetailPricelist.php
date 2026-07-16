<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailPricelist extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(RetailPricelistItem::class, 'pricelist_id');
    }

    public function priceFor(int $productId, float $qty = 1): ?float
    {
        $item = $this->items->firstWhere('product_id', $productId);
        if (!$item || $qty < $item->min_qty) {
            return null;
        }

        return (float) $item->price;
    }
}
