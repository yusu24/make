<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaPond extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'type', 'area',
        'area_m2', 'depth_cm', 'max_fish_count', 'location',
        'capacity_m3', 'status'
    ];

    public function cycles()
    {
        return $this->hasMany(BudidayaCycle::class, 'pond_id');
    }

    public function activeCycle()
    {
        return $this->hasOne(BudidayaCycle::class, 'pond_id')->whereIn('status', ['aktif', 'pembibitan', 'pembesaran', 'panen_sebagian']);
    }
}

