<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KulinerProduct extends Model
{
    use HasFactory;

    protected $fillable = ['tenant_id', 'category_id', 'name', 'description', 'price', 'discount_price', 'stock', 'image_url', 'is_available'];

    public function category()
    {
        return $this->belongsTo(KulinerCategory::class, 'category_id');
    }
}
