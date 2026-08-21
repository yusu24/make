<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialReceivable extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'invoice_number', 'customer_id', 'due_date', 'total_amount', 
        'paid_amount', 'status', 'description', 'source_module', 'source_type', 
        'source_id', 'created_by'
    ];

    protected $casts = [
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    public function payments()
    {
        return $this->hasMany(FinancialReceivablePayment::class, 'receivable_id');
    }
}