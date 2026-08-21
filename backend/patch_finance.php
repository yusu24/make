<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RetailPurchase;
use App\Models\RetailIncome;
use Carbon\Carbon;

echo "Patching RetailPurchases...\n";
$purchases = RetailPurchase::all();
$paidCount = 0;
foreach ($purchases as $p) {
    if (!$p->payment_status) {
        // Since there is logic for RetailPayable (Hutang), let's assume those that don't have payables are 'paid'
        $hasPayable = \App\Models\RetailPayable::where('purchase_id', $p->id)->exists();
        if ($hasPayable) {
            $p->payment_status = 'unpaid';
        } else {
            $p->payment_status = 'paid';
            $paidCount++;
        }
        $p->save();
    }
}
echo "Patched {$purchases->count()} purchases ($paidCount set to paid).\n";

echo "Generating RetailIncome...\n";
$tenantId = 'TN-RETAIL';
$startDate = Carbon::now()->subDays(30);
$endDate = Carbon::now();
$current = clone $startDate;
$incomeCount = 0;

$categories = ['Sponsor', 'Sewa Lapak', 'Fee Supplier', 'Lain-lain'];

while ($current <= $endDate) {
    if (rand(1, 100) > 85) { // 15% chance per day
        RetailIncome::create([
            'tenant_id' => $tenantId,
            'tanggal' => $current->format('Y-m-d'),
            'kategori' => $categories[array_rand($categories)],
            'deskripsi' => 'Pemasukan tambahan ' . uniqid(),
            'nominal' => rand(1, 10) * 50000,
            'created_at' => clone $current,
            'updated_at' => clone $current
        ]);
        $incomeCount++;
    }
    $current->addDay();
}
echo "Generated $incomeCount RetailIncome records.\n";
