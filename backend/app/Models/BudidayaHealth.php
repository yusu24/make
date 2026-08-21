<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaHealth extends Model
{
    use HasFactory;

    protected $fillable = [
        'cycle_id',
        'animal_id',
        'action_type',
        'disease_note',
        'treatment_note',
        'medicine_name',
        'dosage',
        'dosage_unit',
        'mortality_count',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
        'dosage' => 'float',
        'mortality_count' => 'integer',
    ];

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }

    public function animal()
    {
        return $this->belongsTo(BudidayaAnimal::class, 'animal_id');
    }
}
