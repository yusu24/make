<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailProductSerial extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'outlet_id',
        'serial_number',
        'status'
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
