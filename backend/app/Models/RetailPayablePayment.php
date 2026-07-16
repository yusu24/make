<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailPayablePayment extends Model
{
    protected $guarded = [];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function payable()
    {
        return $this->belongsTo(RetailPayable::class, 'payable_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::created(fn (self $payment) => $payment->payable->recalculate());
        static::deleted(fn (self $payment) => $payment->payable->recalculate());
    }
}
