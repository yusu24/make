<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaWorkOrder extends Model
{
    use HasFactory;

    protected $table = 'jasa_work_orders';

    protected $fillable = [
        'tenant_id',
        'spk_number',
        'title',
        'customer_name',
        'customer_company',
        'customer_phone',
        'customer_email',
        'customer_address',
        'category',
        'equipment_name',
        'serial_number',
        'priority',
        'status',
        'scheduled_date',
        'scheduled_time',
        'completion_date',
        'assigned_technician_id',
        'estimated_hours',
        'actual_hours',
        'labor_rate',
        'service_description',
        'root_cause_notes',
        'total_parts_cost',
        'total_labor_cost',
        'grand_total',
        'payment_status',
        'warranty_period',
        'sla_deadline',
        'customer_satisfaction',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completion_date' => 'date',
        'sla_deadline' => 'datetime',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'labor_rate' => 'decimal:2',
        'total_parts_cost' => 'decimal:2',
        'total_labor_cost' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function technician()
    {
        return $this->belongsTo(JasaTechnician::class, 'assigned_technician_id');
    }

    public function parts()
    {
        return $this->hasMany(JasaOrderPart::class, 'work_order_id');
    }

    public function logs()
    {
        return $this->hasMany(JasaWorkOrderLog::class, 'work_order_id')->orderBy('created_at', 'desc');
    }
}
