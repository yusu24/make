<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailProductUnit extends Model
{
    protected $fillable = [
        'product_id',
        'unit',
        'conversion',
        'barcode',
        'price_sell',
    ];

    protected $casts = [
        'conversion' => 'float',
        'price_sell' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }
}
