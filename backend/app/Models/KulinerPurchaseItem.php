<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KulinerPurchaseItem extends Model
{
    protected $guarded = ['id'];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(KulinerPurchase::class, 'purchase_id');
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(KulinerIngredient::class, 'ingredient_id');
    }
}
