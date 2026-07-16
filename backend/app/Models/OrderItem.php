<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'qty', 'price', 'subtotal', 'name',
        'kuliner_product_id', 'bundle_id', 'modifiers', 'addons', 'item_notes',
    ];

    protected $casts = [
        'modifiers' => 'array',
        'addons' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function kulinerProduct()
    {
        return $this->belongsTo(KulinerProduct::class, 'kuliner_product_id');
    }

    public function bundle()
    {
        return $this->belongsTo(KulinerBundle::class, 'bundle_id');
    }
}
