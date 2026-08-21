<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailStockTransferItem extends Model
{
    protected $guarded = [];

    public function transfer()
    {
        return $this->belongsTo(RetailStockTransfer::class, 'transfer_id');
    }

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }
}
