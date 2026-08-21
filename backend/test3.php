<?php
$user = App\Models\User::where('email', 'tani@tanaman.com')->first();
$tenant = App\Models\Tenant::where('tenant_id', $user->tenant_id)->with('businessCategory')->first();
echo "Tenant ID: " . $tenant->tenant_id . "\n";
echo "Category Slug: " . ($tenant->businessCategory ? $tenant->businessCategory->slug : 'NULL') . "\n";
