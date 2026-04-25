<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaPond extends Model
{
    protected $guarded = [];

    public function cycles()
    {
        return $this->hasMany(BudidayaCycle::class, 'pond_id');
    }

    public function activeCycle()
    {
        return $this->hasOne(BudidayaCycle::class, 'pond_id')
            ->whereNotIn('status', ['panen'])
            ->latestOfMany();
    }

    public function sensors()
    {
        return $this->hasMany(BudidayaPondSensor::class, 'pond_id');
    }

    public function latestSensor()
    {
        return $this->hasOne(BudidayaPondSensor::class, 'pond_id')->latestOfMany();
    }
}
