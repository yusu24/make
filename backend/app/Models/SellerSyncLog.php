<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerSyncLog extends Model
{
    use HasFactory;

    protected $table = 'seller_sync_logs';

    protected $fillable = [
        'tenant_id',
        'platform',
        'sync_type',
        'status',
        'items_count',
        'message'
    ];

    protected $casts = [
        'items_count' => 'integer',
    ];
}
