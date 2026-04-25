<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailTransaction extends Model
{
    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(RetailTransactionItem::class, 'transaction_id');
    }

    public function customer()
    {
        return $this->belongsTo(RetailCustomer::class, 'customer_id');
    }
}
