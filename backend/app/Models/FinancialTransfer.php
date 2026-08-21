<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransfer extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'transfer_number', 'date', 'amount', 'from_account_id', 
        'to_account_id', 'description', 'reference_number', 'status', 'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function fromAccount()
    {
        return $this->belongsTo(FinancialAccount::class, 'from_account_id');
    }

    public function toAccount()
    {
        return $this->belongsTo(FinancialAccount::class, 'to_account_id');
    }
}