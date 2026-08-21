<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaTechnician extends Model
{
    use HasFactory;

    protected $table = 'jasa_technicians';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'name',
        'avatar',
        'specialty',
        'phone',
        'email',
        'rating',
        'completed_jobs',
        'current_status',
        'skills',
        'certifications',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'skills' => 'array',
        'certifications' => 'array',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function workOrders()
    {
        return $this->hasMany(JasaWorkOrder::class, 'assigned_technician_id');
    }
}
