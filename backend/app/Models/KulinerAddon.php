<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerAddon extends Model
{
    use HasTenant, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'price', 'sort_order', 'is_active'];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->belongsToMany(KulinerProduct::class, 'kuliner_product_addons', 'addon_id', 'product_id')
            ->withPivot('sort_order');
    }
}
