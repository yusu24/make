<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;

class KulinerShift extends Model
{
    use HasTenant;

    protected $fillable = [
        'tenant_id', 'user_id', 'opening_cash', 'closing_cash', 'expected_cash',
        'difference', 'status', 'note', 'opened_at', 'closed_at',
    ];

    protected $casts = [
        'opening_cash' => 'decimal:2',
        'closing_cash' => 'decimal:2',
        'expected_cash' => 'decimal:2',
        'difference' => 'decimal:2',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
