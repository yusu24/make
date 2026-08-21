<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaSetting extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_settings';

    protected $fillable = [
        'tenant_id',
        'farm_type', // legacy
        'farming_category',
        'farming_profile',
        'tracking_mode',
        'feature_flags',
        'terminology',
        'farm_name',
    ];

    protected $casts = [
        'feature_flags' => 'array',
        'terminology' => 'array',
    ];
}
