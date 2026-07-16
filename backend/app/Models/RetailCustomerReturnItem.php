<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailCustomerReturnItem extends Model
{
    protected $guarded = [];

    public function returnHeader()
    {
        return $this->belongsTo(RetailCustomerReturn::class, 'return_id');
    }

    public function transactionItem()
    {
        return $this->belongsTo(RetailTransactionItem::class, 'transaction_item_id');
    }

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }
}
