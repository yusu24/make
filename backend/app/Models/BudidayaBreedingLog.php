<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaBreedingLog extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_breeding_logs';

    protected $fillable = [
        'tenant_id',
        'breeding_pair_id',
        'cycle_id',
        'event_type',
        'event_date',
        'egg_count',
        'fertile_egg_count',
        'hatched_count',
        'born_alive_count',
        'born_dead_count',
        'expected_date',
        'actual_date',
        'status',
        'offspring_notes',
        'notes',
    ];

    protected $casts = [
        'event_date' => 'date',
        'expected_date' => 'date',
        'actual_date' => 'date',
        'egg_count' => 'integer',
        'fertile_egg_count' => 'integer',
        'hatched_count' => 'integer',
        'born_alive_count' => 'integer',
        'born_dead_count' => 'integer',
    ];

    public function pair()
    {
        return $this->belongsTo(BudidayaBreedingPair::class, 'breeding_pair_id');
    }

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }
}
