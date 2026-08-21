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

// Auto-cleanup: hapus demo sandbox tenant yang tabnya sudah ditutup (heartbeat
// dari frontend berhenti masuk selama 5 menit — lihat AuthController::heartbeat()).
// Jalan tiap menit supaya jeda antara tab ditutup dan data terhapus tetap dekat
// dengan ambang 5 menit itu, bukan menambah keterlambatan lagi di atasnya.
// Dipindah dari inline call di AuthController::createDemoSandbox() supaya klik demo
// sandbox pengguna tidak ikut menunggu proses cleanup (cascading delete banyak tabel).
// Dibatasi hanya production: di local, restart `php artisan serve` saat development
// bikin heartbeat sempat terputus, jadi akun demo yang sedang dites bisa ikut
// terhapus (lalu mendadak ter-logout) padahal tab-nya masih dipakai aktif.
Schedule::call(function () {
    app(\App\Http\Controllers\Api\AuthController::class)->cleanupOldDemoSandboxes();
})->everyMinute()->name('cleanup-demo-sandboxes')->withoutOverlapping()->environments('production');

// Cek tagihan penunggakan (overdue) dan kirim notifikasi setiap hari
Schedule::command('invoices:check-overdue')->daily()->at('01:00');

// Cek langganan tenant yang kedaluwarsa
Schedule::command('app:check-expired-subscriptions')->daily()->at('00:00')->name('check-expired-subscriptions')->withoutOverlapping();

// Backup database + file upload (semua tenant, karena satu DB bersama) setiap
// hari jam 03:00, lalu bersihkan backup lama sesuai retensi di config/backup.php.
// Catatan: ->onOneServer() sengaja tidak dipakai karena butuh cache driver yang
// mendukung atomic lock (database/redis), sedangkan CACHE_DRIVER masih 'file'.
// Baru relevan juga kalau nanti backend dijalankan di lebih dari 1 server.
Schedule::command('backup:run')->daily()->at('03:00')->name('daily-backup')->withoutOverlapping();
Schedule::command('backup:clean')->daily()->at('03:30')->name('cleanup-old-backups')->withoutOverlapping();

// Cek kesehatan backup (umur & ukuran) tiap hari, kirim notifikasi kalau ada yang tidak sehat.
Schedule::command('backup:monitor')->daily()->at('08:00')->name('monitor-backup-health');
