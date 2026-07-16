<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerIngredient extends Model
{
    use HasTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'supplier_id', 'code', 'name', 'category', 'unit',
        'last_price', 'min_stock', 'stock', 'is_active',
    ];

    protected $casts = [
        'last_price' => 'decimal:2',
        'min_stock' => 'decimal:2',
        'stock' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['is_low_stock'];

    public function supplier()
    {
        return $this->belongsTo(KulinerSupplier::class, 'supplier_id');
    }

    public function recipeItems()
    {
        return $this->hasMany(KulinerRecipeItem::class, 'ingredient_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(KulinerIngredientStockMovement::class, 'ingredient_id');
    }

    public function getIsLowStockAttribute(): bool
    {
        return (float) $this->stock <= (float) $this->min_stock;
    }
}
