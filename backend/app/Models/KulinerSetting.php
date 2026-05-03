<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerSetting extends Model
{
    protected $fillable = [
        'tenant_id', 'store_name', 'address', 'phone', 'opening_hours', 
        'operational_days', 'total_tables',
        'hero_title', 'hero_subtitle', 'promo_title', 'promo_desc', 
        'instagram_url', 'whatsapp_number', 'logo_url', 'website_url'
    ];
}
