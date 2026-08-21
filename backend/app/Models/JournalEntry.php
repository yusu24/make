<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'tenant_id', 'date', 'reference_no', 'description', 'module_source'
    ];
    
    protected $casts = [
        'date' => 'date'
    ];
    
    protected static function booted()
    {
        static::addGlobalScope(new \App\Models\Scopes\TenantScope);
    }
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    
    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }
}
