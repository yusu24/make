<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailPurchaseItem extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }

    public function purchase()
    {
        return $this->belongsTo(RetailPurchase::class, 'retail_purchase_id');
    }
}
