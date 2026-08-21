<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaWorkOrderLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'jasa_work_order_logs';

    protected $fillable = [
        'tenant_id',
        'work_order_id',
        'author',
        'action',
        'notes',
        'created_at',
    ];

    public function workOrder()
    {
        return $this->belongsTo(JasaWorkOrder::class, 'work_order_id');
    }
}
