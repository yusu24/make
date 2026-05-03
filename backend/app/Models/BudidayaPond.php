<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaPond extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = ['tenant_id', 'name', 'type', 'capacity_m3', 'status'];

    public function cycles()
    {
        return $this->hasMany(BudidayaCycle::class, 'pond_id');
    }
}
