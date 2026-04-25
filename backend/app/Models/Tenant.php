<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'user_id', 'business_category_id',
        'business_name', 'subscription_plan', 'status', 'trial_ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function businessCategory()
    {
        return $this->belongsTo(BusinessCategory::class);
    }
}
