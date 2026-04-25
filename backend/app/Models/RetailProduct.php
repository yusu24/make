<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailProduct extends Model
{
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
