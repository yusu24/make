<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailSupplier extends Model
{
    use HasTenant;

    protected $guarded = [];
}
