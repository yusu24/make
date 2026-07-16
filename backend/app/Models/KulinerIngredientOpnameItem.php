<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerIngredientOpnameItem extends Model
{
    protected $fillable = ['opname_id', 'ingredient_id', 'system_qty', 'physical_qty', 'difference'];

    public function opname()
    {
        return $this->belongsTo(KulinerIngredientOpname::class, 'opname_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(KulinerIngredient::class, 'ingredient_id');
    }
}
