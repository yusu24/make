<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudidayaUnit extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'budidaya_units';

    protected $fillable = [
        'tenant_id',
        'name',
        'symbol',
        'category', // 'berat', 'volume', 'jumlah', 'kemasan', 'panjang', 'lainnya'
        'description',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];
}
