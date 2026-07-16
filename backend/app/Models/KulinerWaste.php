<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;

class KulinerWaste extends Model
{
    use HasTenant;

    protected $fillable = ['tenant_id', 'ingredient_id', 'quantity', 'reason', 'waste_date', 'value_lost', 'note', 'user_id'];

    protected $casts = [
        'quantity' => 'decimal:2',
        'value_lost' => 'decimal:2',
        'waste_date' => 'date',
    ];

    public function ingredient()
    {
        return $this->belongsTo(KulinerIngredient::class, 'ingredient_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
