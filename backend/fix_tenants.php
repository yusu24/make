<?php
$tenants = App\Models\Tenant::whereHas('businessCategory', function($q){ 
    $q->where('name', 'Toko Retail'); 
})->get();

foreach($tenants as $t) {
    App\Models\RetailProduct::withoutGlobalScopes()->where('tenant_id', (string)$t->id)->update(['tenant_id' => $t->tenant_id]);
    App\Models\RetailCategory::withoutGlobalScopes()->where('tenant_id', (string)$t->id)->update(['tenant_id' => $t->tenant_id]);
    App\Models\RetailUnit::withoutGlobalScopes()->where('tenant_id', (string)$t->id)->update(['tenant_id' => $t->tenant_id]);
    echo "Fixed tenant {$t->id}\n";
}
