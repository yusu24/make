<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailCashTransfer extends Model
{
    use HasTenant;

    protected $fillable = [
        'tenant_id', 'user_id', 'transfer_date', 'from_method', 'to_method', 'amount', 'note'
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
