<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionRequest extends Model
{
    protected $guarded = [];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }
}
