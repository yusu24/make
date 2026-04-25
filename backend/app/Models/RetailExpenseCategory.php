<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailExpenseCategory extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
    ];
}
