<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailSupplierReturn extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function supplier()
    {
        return $this->belongsTo(RetailSupplier::class, 'supplier_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(RetailSupplierReturnItem::class, 'return_id');
    }
}
