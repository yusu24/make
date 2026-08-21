<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaService extends Model
{
    use HasFactory;

    protected $table = 'jasa_services';

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'category',
        'description',
        'base_price',
        'estimated_duration_hours',
        'warranty_days',
        'required_skill_level',
        'recommended_parts',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'estimated_duration_hours' => 'decimal:2',
        'recommended_parts' => 'array',
        'is_active' => 'boolean',
    ];
}
