<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailPricelistItem extends Model
{
    protected $guarded = [];

    public function pricelist()
    {
        return $this->belongsTo(RetailPricelist::class, 'pricelist_id');
    }

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }
}
