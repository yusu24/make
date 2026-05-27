<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BusinessCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'icon', 'color', 'active', 'sort_order',
        'promo_text', 'discount_pct', 'promo_active', 'features_list',
    ];

    protected $casts = [
        'active' => 'boolean',
        'promo_active' => 'boolean',
        'features_list' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }
}
