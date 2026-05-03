<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerTestimonial extends Model
{
    protected $fillable = [
        'tenant_id',
        'customer_name',
        'rating',
        'comment',
        'customer_role',
        'is_displayed'
    ];
}
