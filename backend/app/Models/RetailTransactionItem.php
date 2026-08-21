<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailTransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'product_id', 'unit', 'conversion', 'qty', 'price', 'cost_price', 'subtotal', 'batch_no', 'serial_number'
    ];

    public $timestamps = false;

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }

    public function transaction()
    {
        return $this->belongsTo(RetailTransaction::class, 'transaction_id');
    }
}
