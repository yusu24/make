<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'transaction_number', 'type', 'date', 'amount', 'description',
        'source_module', 'source_type', 'source_id', 'status', 'reverses_id', 'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];
}