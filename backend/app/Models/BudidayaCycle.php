<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class BudidayaCycle extends Model
{
    use HasTenant;
    protected $guarded = [];

    protected $casts = [
        'seed_date' => 'date',
        'expected_harvest_date' => 'date',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }

    public function feedings()
    {
        return $this->hasMany(BudidayaFeeding::class, 'cycle_id');
    }

    public function healths()
    {
        return $this->hasMany(BudidayaHealth::class, 'cycle_id');
    }

    public function harvests()
    {
        return $this->hasMany(BudidayaHarvest::class, 'cycle_id');
    }

    public function expenses()
    {
        return $this->hasMany(BudidayaExpense::class, 'cycle_id');
    }
}
