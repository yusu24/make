<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'name',
        'subject',
        'description',
        'category',
        'priority',
        'status',
        'assigned',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    /**
     * Generate sequential TKT-YYYYMMXXXX IDs.
     */
    public static function generateId(): string
    {
        $year  = now()->year;
        $month = now()->format('m');
        $prefix = 'TKT-' . $year . $month;
        
        $count = static::where('id', 'like', "{$prefix}%")->count() + 1;
        return $prefix . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
