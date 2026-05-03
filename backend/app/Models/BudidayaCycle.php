<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaCycle extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'pond_id', 'fish_type', 'initial_count', 
        'initial_cost', 'start_date', 'end_date', 'status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }
}
