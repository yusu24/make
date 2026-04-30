<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenant;

class BudidayaInventory extends Model
{
    use HasTenant;
    protected $table = 'budidaya_inventories';
    protected $guarded = [];

    public function logs()
    {
        return $this->hasMany(BudidayaInventoryLog::class, 'inventory_id');
    }
}
