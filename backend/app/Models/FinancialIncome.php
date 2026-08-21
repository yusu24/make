<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialIncome extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'income_number', 'date', 'amount', 'account_id', 'category_id',
        'customer_id', 'description', 'reference_number', 'source_module', 
        'source_type', 'source_id', 'status', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    public function category()
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }
}