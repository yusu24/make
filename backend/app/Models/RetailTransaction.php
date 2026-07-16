<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailTransaction extends Model
{
    use HasTenant;

    protected $guarded = [];

    protected $casts = [
        'voided_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(RetailTransactionItem::class, 'transaction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function customer()
    {
        return $this->belongsTo(RetailCustomer::class, 'customer_id');
    }

    public function discount()
    {
        return $this->belongsTo(RetailDiscount::class, 'discount_id');
    }

    public function pricelist()
    {
        return $this->belongsTo(RetailPricelist::class, 'pricelist_id');
    }

    public function voidedBy()
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function isPaid(): bool
    {
        return ($this->status ?? 'paid') === 'paid';
    }

    public function isVoided(): bool
    {
        return $this->status === 'voided';
    }

    public function canBeVoidedBy(User $user): bool
    {
        if (in_array($user->role, ['owner', 'manager', 'admin', 'super_admin'])) {
            return true;
        }

        return $this->user_id === $user->id && $this->created_at->isToday();
    }
}
