<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'tenant_id', 'code', 'name', 'type', 'is_active'
    ];
    
    protected static function booted()
    {
        static::addGlobalScope(new \App\Models\Scopes\TenantScope);
    }
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    
    public function journalLines()
    {
        return $this->hasMany(JournalLine::class);
    }
}
