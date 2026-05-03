<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;

class Order extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 
        'customer_name', 
        'customer_phone',
        'total', 
        'status', 
        'order_type', 
        'table_number', 
        'payment_method', 
        'notes'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
