<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailPayable extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function supplier()
    {
        return $this->belongsTo(RetailSupplier::class, 'supplier_id');
    }

    public function purchase()
    {
        return $this->belongsTo(RetailPurchase::class, 'purchase_id');
    }

    public function payments()
    {
        return $this->hasMany(RetailPayablePayment::class, 'payable_id');
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
