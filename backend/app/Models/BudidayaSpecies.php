<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaSpecies extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_species';

    protected $fillable = [
        'tenant_id',
        'category',
        'name',
        'scientific_name',
        'code',
        'default_unit',
        'target_fcr',
        'harvest_days_target',
        'incubation_days',
        'gestation_days',
        'recommended_parameters',
        'is_active',
    ];

    protected $casts = [
        'recommended_parameters' => 'array',
        'is_active' => 'boolean',
        'target_fcr' => 'float',
    ];

    public function animals()
    {
        return $this->hasMany(BudidayaAnimal::class, 'species_id');
    }

    public function cycles()
    {
        return $this->hasMany(BudidayaCycle::class, 'species_id');
    }
}
