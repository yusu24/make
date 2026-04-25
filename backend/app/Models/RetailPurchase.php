<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailPurchase extends Model
{
    protected $guarded = [];

    public function supplier()
    {
        return $this->belongsTo(RetailSupplier::class, 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(RetailPurchaseItem::class, 'retail_purchase_id');
    }
}
