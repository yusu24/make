<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class BudidayaExpense extends Model
{
    use HasTenant;
    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
    ];

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }
}
