<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaPondSensor extends Model
{
    protected $table = 'budidaya_pond_sensors';

    protected $fillable = [
        'pond_id', 'ph', 'temperature', 'dissolved_oxygen', 'ammonia', 'population', 'age_days',
    ];

    protected $casts = [
        'ph'               => 'float',
        'temperature'      => 'float',
        'dissolved_oxygen' => 'float',
        'ammonia'          => 'float',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }
}
