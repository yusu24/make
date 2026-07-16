<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailUnit extends Model
{
    use HasTenant;

    protected $guarded = [];
}
