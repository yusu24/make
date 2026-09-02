<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerOrder extends Model
{
    use HasFactory;

    protected $table = 'seller_orders';

    protected $fillable = [
        'tenant_id',
        'order_no',
        'platform',
        'customer_name',
        'customer_phone',
        'customer_address',
        'courier',
        'tracking_no',
        'status',
        'total_amount',
        'shipping_cost',
        'payment_method',
        'items',
        'notes',
        'order_date'
    ];

    protected $casts = [
        'total_amount' => 'float',
        'shipping_cost' => 'float',
        'items' => 'array',
        'order_date' => 'datetime',
    ];
}
