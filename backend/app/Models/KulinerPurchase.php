<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KulinerPurchase extends Model
{
    protected $guarded = ['id'];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(KulinerSupplier::class, 'supplier_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(KulinerPurchaseItem::class, 'purchase_id');
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->reference_no)) {
                $count = static::where('tenant_id', $model->tenant_id)->count() + 1;
                $model->reference_no = 'K-PO-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
