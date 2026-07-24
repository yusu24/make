<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-cleanup: hapus activity_logs yang lebih dari 3 hari setiap hari jam 02:00
Schedule::call(function () {
    $deleted = DB::table('activity_logs')
        ->where('created_at', '<', now()->subDays(3))
        ->delete();

    \Log::info("ActivityLog cleanup: {$deleted} records dihapus (> 3 hari).");
})->daily()->at('02:00')->name('cleanup-activity-logs')->withoutOverlapping();

// Auto-cleanup: hapus demo sandbox tenant yang sudah lebih dari 2 jam, setiap 30 menit.
// Dipindah dari inline call di AuthController::createDemoSandbox() supaya klik demo
// sandbox pengguna tidak ikut menunggu proses cleanup (cascading delete banyak tabel).
Schedule::call(function () {
    app(\App\Http\Controllers\Api\AuthController::class)->cleanupOldDemoSandboxes();
})->everyThirtyMinutes()->name('cleanup-demo-sandboxes')->withoutOverlapping();
