<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaCycle extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'pond_id', 'seed_type', 'seed_count', 
        'seed_date', 'expected_harvest_date', 'status'
    ];

    protected $casts = [
        'seed_date' => 'date',
        'expected_harvest_date' => 'date',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
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
        return $this->hasMany(BudidayaSampling::class, 'cycle_id')->orderBy('date', 'asc');
    }
}
