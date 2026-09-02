<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaFinanceCategory extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_finance_categories';

    protected $fillable = [
        'tenant_id',
        'name',
        'type', // 'income' | 'expense'
        'code',
        'description',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];
}
