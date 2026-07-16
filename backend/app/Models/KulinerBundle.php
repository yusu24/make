<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerBundle extends Model
{
    use HasTenant, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'description', 'bundle_price', 'image_url', 'is_active'];

    protected $casts = [
        'bundle_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(KulinerBundleItem::class, 'bundle_id');
    }
}
