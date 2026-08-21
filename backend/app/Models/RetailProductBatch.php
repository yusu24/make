<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'outlet_id',
        'batch_no',
        'expired_date',
        'stock'
    ];

    protected $casts = [
        'expired_date' => 'date'
    ];

    public function product()
    {
        return $this->belongsTo(RetailProduct::class, 'product_id');
    }

    public function outlet()
    {
        return $this->belongsTo(RetailOutlet::class, 'outlet_id');
    }
}
