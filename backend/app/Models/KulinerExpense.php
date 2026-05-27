<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerExpense extends Model
{
    protected $fillable = [
        'tenant_id',
        'date',
        'category',
        'description',
        'amount'
    ];
}
