<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaOrderPart extends Model
{
    use HasFactory;

    protected $table = 'jasa_order_parts';

    protected $fillable = [
        'tenant_id',
        'work_order_id',
        'name',
        'quantity',
        'unit_cost',
        'subtotal',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function workOrder()
    {
        return $this->belongsTo(JasaWorkOrder::class, 'work_order_id');
    }
}
