<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaAccount extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'jasa_accounts';

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'account_number',
        'balance',
        'color',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];
}