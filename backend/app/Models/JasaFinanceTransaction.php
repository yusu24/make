<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JasaFinanceTransaction extends Model
{
    use HasFactory;

    protected $table = 'jasa_finance_transactions';

    protected $fillable = [
        'tenant_id',
        'transaction_number',
        'type',
        'category',
        'amount',
        'transaction_date',
        'payment_method',
        'reference_number',
        'recipient_or_payer',
        'notes',
        'work_order_id',
        'contract_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date'
    ];
}
