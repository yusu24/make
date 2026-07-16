<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class RetailCategory extends Model
{
    use HasTenant;

    protected $guarded = [];
}
