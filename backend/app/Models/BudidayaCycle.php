<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaCycle extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'pond_id', 'species_id', 'category', 'tracking_mode',
        'seed_type', 'seed_count', 'initial_weight_gram', 'initial_cost',
        'seed_date', 'expected_harvest_date', 'status'
    ];

    protected $casts = [
        'seed_date' => 'date',
        'expected_harvest_date' => 'date',
        'initial_weight_gram' => 'float',
        'initial_cost' => 'float',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }

    public function species()
    {
        return $this->belongsTo(BudidayaSpecies::class, 'species_id');
    }

    public function animals()
    {
        return $this->hasMany(BudidayaAnimal::class, 'cycle_id');
    }

    public function expenses()
    {
        return $this->hasMany(BudidayaExpense::class, 'cycle_id');
    }

    public function harvests()
    {
        return $this->hasMany(BudidayaHarvest::class, 'cycle_id');
    }

    public function feedings()
    {
        return $this->hasMany(BudidayaFeeding::class, 'cycle_id');
    }

    public function healths()
    {
        return $this->hasMany(BudidayaHealth::class, 'cycle_id');
    }

    public function samplings()
    {
        return $this->hasMany(BudidayaSampling::class, 'cycle_id');
    }

    public function breedingLogs()
    {
        return $this->hasMany(BudidayaBreedingLog::class, 'cycle_id');
    }
}
