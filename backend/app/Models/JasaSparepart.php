<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaSparepart extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'jasa_spareparts';

    protected $fillable = [
        'tenant_id',
        'item_code',
        'name',
        'category',
        'price',
        'stock',
        'unit',
        'min_stock_alert',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'min_stock_alert' => 'integer',
    ];
}
