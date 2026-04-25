<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaStaff extends Model
{
    protected $fillable = [
        'tenant_id', 'user_id', 'budidaya_role_id',
        'name', 'email', 'phone', 'position', 'status', 'last_active_at',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(BudidayaRole::class, 'budidaya_role_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
