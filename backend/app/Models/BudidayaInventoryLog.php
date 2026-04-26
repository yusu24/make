<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaInventoryLog extends Model
{
    protected $table = 'budidaya_inventory_logs';
    protected $guarded = [];

    public function inventory()
    {
        return $this->belongsTo(BudidayaInventory::class, 'inventory_id');
    }
}
