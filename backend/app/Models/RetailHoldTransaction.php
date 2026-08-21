<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailHoldTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'customer_id',
        'reference_name',
        'cart_data',
        'total_amount'
    ];

    protected $casts = [
        'cart_data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(RetailCustomer::class, 'customer_id');
    }
}
