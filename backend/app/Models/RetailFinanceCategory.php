<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasTenant;

class RetailFinanceCategory extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'retail_finance_categories';

    protected $fillable = [
        'tenant_id',
        'type', // 'income' or 'expense'
        'name',
    ];
}
