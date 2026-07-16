<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KulinerProduct extends Model
{
    use HasFactory;

    protected $fillable = ['tenant_id', 'category_id', 'name', 'description', 'price', 'discount_price', 'stock', 'image_url', 'is_available'];

    public function category()
    {
        return $this->belongsTo(KulinerCategory::class, 'category_id');
    }

    public function recipeItems()
    {
        return $this->hasMany(KulinerRecipeItem::class, 'product_id');
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(KulinerModifierGroup::class, 'kuliner_product_modifier_groups', 'product_id', 'modifier_group_id')
            ->withPivot('sort_order');
    }

    public function addons()
    {
        return $this->belongsToMany(KulinerAddon::class, 'kuliner_product_addons', 'product_id', 'addon_id')
            ->withPivot('sort_order');
    }
}
