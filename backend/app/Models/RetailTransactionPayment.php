<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailTransactionPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'payment_method',
        'amount'
    ];

    public function transaction()
    {
        return $this->belongsTo(RetailTransaction::class, 'transaction_id');
    }
}
