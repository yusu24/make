<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailSupplierReturnItem extends Model
{
    protected $guarded = [];

    public function returnHeader()
    {
        return $this->belongsTo(RetailSupplierReturn::class, 'return_id');
    }

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }
}
