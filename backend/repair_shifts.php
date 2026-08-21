<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RetailShift;
use Carbon\Carbon;

echo "Repairing existing shifts...\n";
$shifts = RetailShift::all();
$updated = 0;

foreach ($shifts as $shift) {
    if (!$shift->opened_at) continue;

    $baseDate = clone $shift->opened_at;
    $baseDate->startOfDay(); // normalize to midnight

    // random pick shift: 0=Pagi, 1=Siang, 2=Malam
    $shiftType = rand(0, 2);
    
    if ($shiftType === 0) {
        $shift->opened_at = (clone $baseDate)->addHours(8); // 08:00
        $shift->closed_at = (clone $baseDate)->addHours(15); // 15:00
    } elseif ($shiftType === 1) {
        $shift->opened_at = (clone $baseDate)->addHours(15); // 15:00
        $shift->closed_at = (clone $baseDate)->addHours(22); // 22:00
    } else {
        $shift->opened_at = (clone $baseDate)->addHours(23); // 23:00
        $shift->closed_at = (clone $baseDate)->addDays(1)->addHours(6); // 06:00 next day
    }

    $shift->save();
    $updated++;
}

echo "Successfully randomized hours for $updated shifts.\n";
