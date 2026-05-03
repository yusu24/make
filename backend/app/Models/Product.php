<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'name', 'type', 'price', 'cost', 'stock', 'unit'
    ];

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
