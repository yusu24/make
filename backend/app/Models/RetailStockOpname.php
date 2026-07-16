<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailStockOpname extends Model
{
    use HasTenant;

    protected $guarded = [];

    protected $casts = [
        'finalized_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(RetailStockOpnameItem::class, 'opname_id');
    }
}
