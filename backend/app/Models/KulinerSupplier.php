<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerSupplier extends Model
{
    use HasTenant, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'contact', 'address'];

    public function ingredients()
    {
        return $this->hasMany(KulinerIngredient::class, 'supplier_id');
    }
}
