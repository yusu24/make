<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaSampling extends Model
{
    protected $fillable = [
        'cycle_id',
        'average_weight_gram',
        'estimated_biomass_kg',
        'date',
        'sample_count',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'average_weight_gram' => 'decimal:2',
        'estimated_biomass_kg' => 'decimal:2',
    ];

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }
}
