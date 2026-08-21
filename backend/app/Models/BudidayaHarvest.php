<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaHarvest extends Model
{
    use HasFactory;

    protected $fillable = [
        'cycle_id',
        'output_type',
        'total_count',
        'unit_label',
        'total_weight_kg',
        'sale_price_per_kg',
        'total_revenue',
        'harvest_date',
        'notes',
        'grade_breakdown',
    ];

    protected $casts = [
        'harvest_date' => 'date',
        'total_weight_kg' => 'float',
        'sale_price_per_kg' => 'float',
        'total_revenue' => 'float',
        'total_count' => 'integer',
        'grade_breakdown' => 'array',
    ];

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }
}
