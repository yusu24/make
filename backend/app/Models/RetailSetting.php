<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailSetting extends Model
{
    use HasTenant;

    protected $guarded = [];

    protected $casts = [
        'tax_rate'                   => 'decimal:2',
        'points_ratio'               => 'integer',
        'low_stock_default_threshold'=> 'decimal:2',
        'enable_tax'                 => 'boolean',
        'enable_loyalty'             => 'boolean',
    ];
}
