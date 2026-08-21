<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPayablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payable_id', 'payment_date', 'amount', 'account_id', 'reference_number', 
        'notes', 'created_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function payable()
    {
        return $this->belongsTo(FinancialPayable::class, 'payable_id');
    }

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }
}