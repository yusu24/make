<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\RetailTransaction;
use App\Models\RetailProduct;
use App\Models\RetailTransactionItem;

echo "--- DIAGNOSTIC DATA ---\n";
$tenant = 'TN-001';
echo "Checking Tenant: $tenant\n";

$txCount = RetailTransaction::where('tenant_id', $tenant)->count();
echo "Transactions for $tenant: $txCount\n";

$pCount = RetailProduct::where('tenant_id', $tenant)->count();
echo "Products for $tenant: $pCount\n";

$allTx = RetailTransaction::all();
echo "Total Transactions (all tenants): " . $allTx->count() . "\n";
foreach ($allTx as $tx) {
    echo " - ID: {$tx->id}, Tenant: {$tx->tenant_id}, Total: {$tx->total_amount}\n";
}

$allP = RetailProduct::all();
echo "Total Products (all tenants): " . $allP->count() . "\n";
foreach ($allP as $p) {
    echo " - ID: {$p->id}, Tenant: {$p->tenant_id}, Name: {$p->name}\n";
}
