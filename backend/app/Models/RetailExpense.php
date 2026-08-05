<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailExpense extends Model
{
    use HasTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'tanggal',
        'keterangan',
        'nominal',
        'kategori',
        'finance_category_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(RetailFinanceCategory::class, 'finance_category_id');
    }
}
