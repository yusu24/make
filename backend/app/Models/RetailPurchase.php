<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailPurchase extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function supplier()
    {
        return $this->belongsTo(RetailSupplier::class, 'supplier_id');
    }

    public function items()
    {
        return $this->hasMany(RetailPurchaseItem::class, 'purchase_id');
    }
}
