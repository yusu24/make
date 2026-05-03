<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pond extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = ['tenant_id', 'name', 'size'];

    public function cycles()
    {
        return $this->hasMany(Cycle::class);
    }
}
