<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailProduct extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(RetailCategory::class, 'category_id');
    }

    public function supplier()
    {
        return $this->belongsTo(RetailSupplier::class, 'supplier_id');
    }
}
