<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$txs = \App\Models\RetailTransaction::where('tax_amount', 0)->orWhereNull('tax_amount')->get();
$updated = 0;
foreach($txs as $t) {
    if(rand(0,1)) {
        $tax = round($t->total_amount * 0.11);
        $t->update([
            'tax_amount' => $tax,
            'total_amount' => $t->total_amount + $tax
        ]);
        $updated++;
    }
}
echo "Updated $updated transactions with tax!\n";
