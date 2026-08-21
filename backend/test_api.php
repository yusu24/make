<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::find(4);
auth()->login($user);

$req = Request::create('/api/retail/reports/payments', 'GET', ['startDate' => '2026-07-01', 'endDate' => '2026-08-31']);
$res = app()->handle($req)->getContent();
echo "Payments API (Jul-Aug): \n";
echo substr($res, 0, 500) . "\n\n";

$req2 = Request::create('/api/retail/reports/consignment', 'GET', ['startDate' => '2026-07-01', 'endDate' => '2026-08-31']);
$res2 = app()->handle($req2)->getContent();
echo "Consignment API (Jul-Aug): \n";
echo substr($res2, 0, 500) . "\n\n";
