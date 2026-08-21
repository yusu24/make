<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailStockTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'from_outlet_id',
        'to_outlet_id',
        'reference_no',
        'status',
        'note'
    ];

    public function fromOutlet()
    {
        return $this->belongsTo(RetailOutlet::class, 'from_outlet_id');
    }

    public function toOutlet()
    {
        return $this->belongsTo(RetailOutlet::class, 'to_outlet_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(RetailStockTransferItem::class, 'transfer_id');
    }
}
