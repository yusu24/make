<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KulinerBundleItem extends Model
{
    protected $fillable = ['bundle_id', 'product_id', 'quantity'];

    public function bundle()
    {
        return $this->belongsTo(KulinerBundle::class, 'bundle_id');
    }

    public function product()
    {
        return $this->belongsTo(KulinerProduct::class, 'product_id');
    }
}
