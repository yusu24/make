<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingSetting extends Model
{
    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'hero_desc',
        'campaign_text',
        'campaign_active',
        'show_sandbox',
        'show_features',
        'show_testimonials',
        'featured_categories',
        'bank_name',
        'bank_account_no',
        'bank_account_name',
        'price_basic',
        'price_pro',
    ];

    protected $casts = [
        'campaign_active' => 'boolean',
        'show_sandbox' => 'boolean',
        'show_features' => 'boolean',
        'show_testimonials' => 'boolean',
        'featured_categories' => 'array',
        'price_basic' => 'integer',
        'price_pro' => 'integer',
    ];
}
