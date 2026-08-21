<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaAnimal extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_animals';

    protected $fillable = [
        'tenant_id',
        'pond_id',
        'cycle_id',
        'species_id',
        'tag_code',
        'name',
        'category',
        'species_name',
        'breed',
        'gender',
        'birth_date',
        'entry_date',
        'initial_weight_kg',
        'current_weight_kg',
        'father_id',
        'mother_id',
        'status',
        'purchase_price',
        'selling_price',
        'exit_date',
        'exit_reason',
        'photo_url',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'entry_date' => 'date',
        'exit_date' => 'date',
        'initial_weight_kg' => 'float',
        'current_weight_kg' => 'float',
        'purchase_price' => 'float',
        'selling_price' => 'float',
        'metadata' => 'array',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }

    public function species()
    {
        return $this->belongsTo(BudidayaSpecies::class, 'species_id');
    }

    public function father()
    {
        return $this->belongsTo(BudidayaAnimal::class, 'father_id');
    }

    public function mother()
    {
        return $this->belongsTo(BudidayaAnimal::class, 'mother_id');
    }

    public function childrenAsFather()
    {
        return $this->hasMany(BudidayaAnimal::class, 'father_id');
    }

    public function childrenAsMother()
    {
        return $this->hasMany(BudidayaAnimal::class, 'mother_id');
    }

    public function healthLogs()
    {
        return $this->hasMany(BudidayaHealth::class, 'animal_id');
    }
}
