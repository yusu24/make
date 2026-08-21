<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaBreedingPair extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_breeding_pairs';

    protected $fillable = [
        'tenant_id',
        'pond_id',
        'pair_code',
        'name',
        'male_animal_id',
        'female_animal_id',
        'male_name',
        'female_name',
        'paired_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'paired_date' => 'date',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }

    public function maleAnimal()
    {
        return $this->belongsTo(BudidayaAnimal::class, 'male_animal_id');
    }

    public function femaleAnimal()
    {
        return $this->belongsTo(BudidayaAnimal::class, 'female_animal_id');
    }

    public function logs()
    {
        return $this->hasMany(BudidayaBreedingLog::class, 'breeding_pair_id')->orderBy('event_date', 'desc');
    }
}
