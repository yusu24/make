<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerChannel extends Model
{
    use HasFactory;

    protected $table = 'seller_channels';

    protected $fillable = [
        'tenant_id',
        'platform',
        'store_name',
        'account_id',
        'status',
        'auto_sync',
        'sync_interval_mins',
        'last_sync_at',
        'auth_token'
    ];

    protected $casts = [
        'auto_sync' => 'boolean',
        'sync_interval_mins' => 'integer',
        'last_sync_at' => 'datetime',
    ];
}
