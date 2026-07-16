<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerModifierGroup extends Model
{
    use HasTenant, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'is_required', 'sort_order', 'is_active'];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function options()
    {
        return $this->hasMany(KulinerModifierOption::class, 'modifier_group_id')->orderBy('sort_order');
    }

    public function products()
    {
        return $this->belongsToMany(KulinerProduct::class, 'kuliner_product_modifier_groups', 'modifier_group_id', 'product_id')
            ->withPivot('sort_order');
    }
}
