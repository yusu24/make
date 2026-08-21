<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RetailProduct;
use App\Models\RetailTransaction;
use App\Models\RetailTransactionPayment;

echo "Repairing Products (setting consignment)...\n";
$products = RetailProduct::all();
$consignmentCount = 0;
foreach($products as $p) {
    if (rand(1, 100) > 80) { // 20%
        $p->is_consignment = 1;
        $p->save();
        $consignmentCount++;
    }
}
echo "Updated $consignmentCount products to consignment.\n";

echo "Repairing Payments...\n";
$txs = RetailTransaction::where('status', 'paid')->get();
$paymentCount = 0;
foreach($txs as $tx) {
    if ($tx->payments()->count() == 0) {
        RetailTransactionPayment::create([
            'transaction_id' => $tx->id,
            'amount' => $tx->total_amount,
            'payment_method' => $tx->payment_method ?? 'CASH',
            'created_at' => $tx->created_at,
            'updated_at' => $tx->updated_at
        ]);
        $paymentCount++;
    }
}
echo "Created $paymentCount payment records.\n";
