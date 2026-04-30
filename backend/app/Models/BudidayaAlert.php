<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class BudidayaAlert extends Model
{
    use HasTenant;
    
    protected $table = 'budidaya_alerts';
    protected $guarded = [];

    public function pond()
    {
        return $this->belongsTo(BudidayaPond::class, 'pond_id');
    }
}
