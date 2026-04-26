<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudidayaInventory extends Model
{
    protected $table = 'budidaya_inventories';
    protected $guarded = [];

    public function logs()
    {
        return $this->hasMany(BudidayaInventoryLog::class, 'inventory_id');
    }
}
