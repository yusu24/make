<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KulinerTable extends Model
{
    use HasTenant, SoftDeletes;

    protected $table = 'kuliner_tables';

    protected $fillable = ['tenant_id', 'name', 'status', 'capacity', 'position_x', 'position_y'];

    protected $casts = [
        'capacity' => 'integer',
        'position_x' => 'integer',
        'position_y' => 'integer',
    ];
}
