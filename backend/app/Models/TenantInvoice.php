<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantInvoice extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'plan',
        'amount',
        'status',
        'date',
        'due_date',
        'paid_at',
    ];

    protected $casts = [
        'date'     => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'paid_at'  => 'datetime',
        'amount'   => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    /**
     * Auto-generate INV-xxx style IDs.
     */
    public static function generateId(): string
    {
        $year  = now()->year;
        $month = now()->format('m');
        $count = static::whereYear('created_at', $year)->whereMonth('created_at', $month)->count() + 1;
        return 'INV-' . $year . $month . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
