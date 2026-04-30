<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KulinerCategory extends Model
{
    use HasFactory;

    protected $fillable = ['tenant_id', 'name', 'slug', 'description', 'image_url'];


    public function products()
    {
        return $this->hasMany(KulinerProduct::class, 'category_id');
    }
}
