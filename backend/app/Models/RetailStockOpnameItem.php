<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailStockOpnameItem extends Model
{
    protected $guarded = [];

    public function opname()
    {
        return $this->belongsTo(RetailStockOpname::class, 'opname_id');
    }

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }
}
