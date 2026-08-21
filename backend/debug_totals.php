<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RetailTransaction;

$start = '2026-08-01';
$end = '2026-08-19';
$tenantId = 'TN-RETAIL'; // assuming TN-RETAIL for demo

$transactions = RetailTransaction::where('tenant_id', $tenantId)
    ->where('status', 'paid')
    ->whereBetween('created_at', ["$start 00:00:00", "$end 23:59:59"])
    ->with('payments')
    ->latest()
    ->get();

$total_tax = $transactions->sum('tax_amount');
$total_payments = 0;
foreach($transactions as $tx) {
    foreach($tx->payments as $payment) {
        $total_payments += $payment->amount;
    }
}

echo "Total Tx in Aug: " . $transactions->count() . "\n";
echo "Total Payments in Aug: " . $total_payments . "\n";
echo "Total Tax in Aug: " . $total_tax . "\n";
