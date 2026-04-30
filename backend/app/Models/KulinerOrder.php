<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerOrder extends Model
{
    protected $fillable = [
        'tenant_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'order_type',
        'table_number',
        'payment_method',
        'total_amount',
        'service_fee',
        'status',
        'notes'
    ];

    public function items()
    {
        return $this->hasMany(KulinerOrderItem::class, 'order_id');
    }
}
