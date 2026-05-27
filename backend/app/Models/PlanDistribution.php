<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanDistribution extends Model
{
    use HasFactory;

    protected $table = 'plan_distribution';
    protected $guarded = ['id'];
    public $timestamps = false;
}
