<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaContract extends Model
{
    use HasFactory;

    protected $table = 'jasa_contracts';

    protected $fillable = [
        'tenant_id',
        'contract_number',
        'title',
        'client_company',
        'client_name',
        'client_phone',
        'client_email',
        'client_address',
        'service_category',
        'equipment_list',
        'start_date',
        'end_date',
        'frequency',
        'total_visits_quota',
        'completed_visits_count',
        'next_schedule_date',
        'contract_value',
        'assigned_technician_id',
        'status',
        'sla_notes',
    ];

    protected $casts = [
        'equipment_list' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_schedule_date' => 'date',
        'contract_value' => 'decimal:2',
        'total_visits_quota' => 'integer',
        'completed_visits_count' => 'integer',
    ];

    public function technician()
    {
        return $this->belongsTo(JasaTechnician::class, 'assigned_technician_id');
    }

    public function workOrders()
    {
        return $this->hasMany(JasaWorkOrder::class, 'customer_company', 'client_company');
    }

    /**
     * Compute remaining days until expiration
     */
    public function getDaysUntilExpirationAttribute(): int
    {
        if (!$this->end_date) return 0;
        return (int) now()->diffInDays($this->end_date, false);
    }
}
