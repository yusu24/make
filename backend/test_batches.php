<?php
$tenantId = App\Models\Tenant::where('tenant_id', 'TN-DS-L6IX8GJF')->value('id');
auth()->login(App\Models\User::where('tenant_id', 'TN-DS-L6IX8GJF')->first());
$batches = App\Models\RetailProductBatch::with(['product', 'outlet'])->where('tenant_id', $tenantId)->get()->toArray();

file_put_contents('test_batches.json', json_encode($batches, JSON_PRETTY_PRINT));
echo "OK\n";
