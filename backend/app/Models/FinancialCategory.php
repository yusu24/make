<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialCategory extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'code', 'name', 'type', 'parent_id', 'is_system', 'is_active'
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(FinancialCategory::class, 'parent_id');
    }
}