<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailExpenseCategory extends Model
{
    use HasTenant;

    protected $fillable = [
        'tenant_id',
        'name',
    ];
}
