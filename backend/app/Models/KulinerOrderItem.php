<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerOrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'quantity',
        'price'
    ];

    public function order()
    {
        return $this->belongsTo(KulinerOrder::class, 'order_id');
    }
}
