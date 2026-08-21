<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialAccount extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'code', 'name', 'type', 'currency', 'opening_balance', 
        'opening_balance_date', 'is_active', 'description', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'opening_balance_date' => 'date',
        'is_active' => 'boolean',
    ];
}