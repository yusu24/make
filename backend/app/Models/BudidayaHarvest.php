<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaHarvest extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
    ];

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }
}
