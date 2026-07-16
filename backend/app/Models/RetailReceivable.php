<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailReceivable extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function customer()
    {
        return $this->belongsTo(RetailCustomer::class, 'customer_id');
    }

    public function transaction()
    {
        return $this->belongsTo(RetailTransaction::class, 'transaction_id');
    }

    public function payments()
    {
        return $this->hasMany(RetailReceivablePayment::class, 'receivable_id');
    }

    public function getRemainingAttribute(): float
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function recalculate(): void
    {
        $paid = $this->payments()->sum('amount_paid');
        $status = $paid >= $this->total_amount ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid');

        $this->update(['paid_amount' => $paid, 'status' => $status]);
    }
}
