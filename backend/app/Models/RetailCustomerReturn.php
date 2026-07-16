<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailCustomerReturn extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function transaction()
    {
        return $this->belongsTo(RetailTransaction::class, 'transaction_id');
    }

    public function customer()
    {
        return $this->belongsTo(RetailCustomer::class, 'customer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(RetailCustomerReturnItem::class, 'return_id');
    }
}
