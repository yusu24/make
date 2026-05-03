<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'type', 'source', 'reference_id', 'amount', 'description', 'date'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
