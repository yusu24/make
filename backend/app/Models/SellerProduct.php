<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerProduct extends Model
{
    use HasFactory;

    protected $table = 'seller_products';

    protected $fillable = [
        'tenant_id',
        'name',
        'sku',
        'category',
        'price',
        'cost_price',
        'stock',
        'min_stock',
        'weight_gram',
        'image_url',
        'description',
        'status',
        'marketplace_mappings'
    ];

    protected $casts = [
        'price' => 'float',
        'cost_price' => 'float',
        'stock' => 'integer',
        'min_stock' => 'integer',
        'weight_gram' => 'integer',
        'marketplace_mappings' => 'array',
    ];
}
