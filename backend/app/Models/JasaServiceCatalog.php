<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaServiceCatalog extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'recommended_parts' => 'array',
        'base_price' => 'float',
        'estimated_duration_hours' => 'float',
        'warranty_days' => 'integer',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
