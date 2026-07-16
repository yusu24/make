<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;

class KulinerRecipeItem extends Model
{
    use HasTenant;

    protected $fillable = ['tenant_id', 'product_id', 'ingredient_id', 'quantity', 'note'];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    public function product()
    {
        return $this->belongsTo(KulinerProduct::class, 'product_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(KulinerIngredient::class, 'ingredient_id');
    }
}
