<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerSetting extends Model
{
    protected $fillable = [
        'tenant_id', 'store_name', 'address', 'phone', 'opening_hours', 
        'operational_days', 'total_tables',
        'hero_title', 'hero_subtitle', 'hero_image_url', 'promo_title', 'promo_desc', 
        'instagram_url', 'whatsapp_number', 'logo_url', 'website_url',
        'dine_in_enabled',
        'enable_tax',
        'tax_rate',
        'service_charge_rate',
        'auto_backup_enabled',
        'auto_backup_frequency',
        'auto_backup_format',
        'auto_backup_email',
        'last_auto_backup_at',
    ];

    protected $casts = [
        'dine_in_enabled'     => 'boolean',
        'enable_tax'          => 'boolean',
        'tax_rate'            => 'decimal:2',
        'service_charge_rate' => 'decimal:2',
        'auto_backup_enabled' => 'boolean',
        'last_auto_backup_at' => 'datetime',
    ];
}
