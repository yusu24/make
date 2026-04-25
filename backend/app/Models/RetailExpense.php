<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailExpense extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'tanggal',
        'keterangan',
        'nominal',
        'kategori',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
