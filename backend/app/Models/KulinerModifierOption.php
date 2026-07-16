<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerModifierOption extends Model
{
    use SoftDeletes;

    protected $fillable = ['modifier_group_id', 'name', 'price_delta', 'is_default', 'sort_order', 'is_active'];

    protected $casts = [
        'price_delta' => 'decimal:2',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function group()
    {
        return $this->belongsTo(KulinerModifierGroup::class, 'modifier_group_id');
    }
}
