<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JasaSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'business_type',
        'term_technician',
        'term_sparepart',
        'term_spk',
        'document_prefix',
        'service_categories',
        'technician_specialties',
        'inventory_categories',
        'auto_backup_enabled',
        'auto_backup_frequency',
        'auto_backup_format',
        'auto_backup_email',
        'last_auto_backup_at',
    ];

    protected $casts = [
        'service_categories'     => 'array',
        'technician_specialties' => 'array',
        'inventory_categories'   => 'array',
        'auto_backup_enabled'    => 'boolean',
        'last_auto_backup_at'    => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
