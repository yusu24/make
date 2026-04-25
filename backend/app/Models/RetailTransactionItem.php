<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailTransactionItem extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }

    public function transaction()
    {
        return $this->belongsTo(RetailTransaction::class, 'transaction_id');
    }
}
