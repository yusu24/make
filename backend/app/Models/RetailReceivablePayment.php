<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailReceivablePayment extends Model
{
    protected $guarded = [];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function receivable()
    {
        return $this->belongsTo(RetailReceivable::class, 'receivable_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::created(fn (self $payment) => $payment->receivable->recalculate());
        static::deleted(fn (self $payment) => $payment->receivable->recalculate());
    }
}
