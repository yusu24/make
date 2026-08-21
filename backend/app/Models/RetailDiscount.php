<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailDiscount extends Model
{
    use HasTenant;

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'conditions' => 'array',
    ];

    public function isValidFor(float $subtotal): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }
        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }
        if ($subtotal < $this->min_purchase) {
            return false;
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $subtotal, array $items = []): float
    {
        if ($this->promo_type === 'conditional' && is_array($this->conditions)) {
            // Very basic BOGO logic (buy X get Y free)
            $buyQty = $this->conditions['buy_qty'] ?? 0;
            $freeQty = $this->conditions['free_qty'] ?? 0;
            $targetProductId = $this->conditions['product_id'] ?? null;

            if ($buyQty > 0 && $freeQty > 0 && $targetProductId) {
                $discountAmount = 0;
                foreach ($items as $item) {
                    if ($item['product']->id == $targetProductId) {
                        $eligibleSets = floor($item['qty'] / ($buyQty + $freeQty));
                        if ($eligibleSets > 0) {
                            $discountAmount += ($eligibleSets * $freeQty * $item['price']);
                        }
                    }
                }
                return $discountAmount;
            }
        }

        return match ($this->type) {
            'percentage' => round($subtotal * $this->value / 100, 2),
            'flat' => min($this->value, $subtotal),
            default => 0,
        };
    }
}
