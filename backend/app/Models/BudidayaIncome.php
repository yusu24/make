<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudidayaIncome extends Model
{
    use HasFactory;

    protected $table = 'budidaya_incomes';

    protected $fillable = [
        'tenant_id',
        'cycle_id',
        'category',
        'amount',
        'date',
        'payment_method',
        'recipient_or_buyer',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date'
    ];

    public function cycle()
    {
        return $this->belongsTo(BudidayaCycle::class, 'cycle_id');
    }
}
