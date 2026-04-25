<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Tenant;

$user = User::where('email', 'customer@umkm.com')->first();
if ($user) {
    if ($user->tenant) {
        $user->tenant->subscription_plan = 'free';
        $user->tenant->created_at = now()->subDays(6);
        $user->tenant->save();
        echo "Successfully locked tenant for {$user->email}\n";
    }
    
    // Also delete any pending requests so the status is clean
    \App\Models\SubscriptionRequest::where('tenant_id', $user->tenant_id)->delete();
}
