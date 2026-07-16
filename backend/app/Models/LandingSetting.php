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
        'admin_logo_path',
        'landing_logo_path',
        'featured_categories',
        'bank_name',
        'bank_account_no',
        'bank_account_name',
        'price_basic',
        'price_pro',
    ];

    protected $appends = [
        'admin_logo_url',
        'landing_logo_url'
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

    public function getAdminLogoUrlAttribute()
    {
        return $this->admin_logo_path ? url('storage/' . $this->admin_logo_path) : null;
    }

    public function getLandingLogoUrlAttribute()
    {
        return $this->landing_logo_path ? url('storage/' . $this->landing_logo_path) : null;
    }
}
