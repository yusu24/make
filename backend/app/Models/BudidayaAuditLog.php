<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class BudidayaAuditLog extends Model
{
    use HasTenant;

    protected $table = 'budidaya_audit_logs';
    protected $guarded = [];
    
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function auditable()
    {
        return $this->morphTo();
    }
}
