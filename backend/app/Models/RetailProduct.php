<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailProduct extends Model
{
    use HasTenant;

    protected $guarded = [];

    protected $casts = [
        'price_buy' => 'integer',
        'price_sell' => 'integer',
        'price_shopee' => 'integer',
        'price_tokopedia' => 'integer',
        'price_tiktok' => 'integer',
        'price_lazada' => 'integer',
        'stock' => 'integer',
        'stock_min' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(RetailCategory::class, 'category_id');
    }

    public function supplier()
    {
        return $this->belongsTo(RetailSupplier::class, 'supplier_id');
    }

    public function multi_units()
    {
        return $this->hasMany(RetailProductUnit::class, 'product_id');
    }

    public function outletStocks()
    {
        return $this->hasMany(RetailProductStock::class, 'product_id');
    }

    public function batches()
    {
        return $this->hasMany(RetailProductBatch::class, 'product_id');
    }

    public function serials()
    {
        return $this->hasMany(RetailProductSerial::class, 'product_id');
    }
}
