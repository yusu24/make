<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\JasaStoreBackupExport;
use App\Models\Tenant;
use App\Models\JasaSetting;
use App\Models\User;
use App\Http\Controllers\Api\Jasa\JasaBackupController;

class SendTenantJasaBackups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jasa:auto-backup {--force : Force send backup regardless of schedule/last run time}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate and send scheduled automatic backups (Excel / JSON) via email to Jasa (Service & Field Ops) tenant owners.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai proses backup otomatis untuk tenant Jasa...');

        $force = $this->option('force');
        $now   = Carbon::now();

        $settings = JasaSetting::where('auto_backup_enabled', true)->get();

        if ($settings->isEmpty()) {
            $this->info('Tidak ada tenant Jasa dengan backup otomatis aktif.');
            return 0;
        }

        $sentCount    = 0;
        $skippedCount = 0;

        foreach ($settings as $setting) {
            $tenantId = $setting->tenant_id;
            if (!$tenantId) continue;

            $tenant = Tenant::where('tenant_id', $tenantId)->first();
            if (!$tenant || $tenant->status !== 'active') {
                $this->warn("Tenant [{$tenantId}] dilewati karena tidak aktif atau tidak ditemukan.");
                $skippedCount++;
                continue;
            }

            // Determine recipient email
            $email = $setting->auto_backup_email;
            if (!$email) {
                $owner = User::where('tenant_id', $tenantId)
                    ->whereIn('role', ['customer', 'super_admin'])
                    ->first();
                $email = $owner?->email;
            }

            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->warn("Tenant [{$tenantId}] dilewati karena alamat email tidak valid.");
                $skippedCount++;
                continue;
            }

            // Check if schedule is due
            $isDue = $force;
            if (!$isDue) {
                $lastBackup = $setting->last_auto_backup_at
                    ? Carbon::parse($setting->last_auto_backup_at)
                    : null;
                $frequency = $setting->auto_backup_frequency ?: 'weekly';

                if (!$lastBackup) {
                    $isDue = true;
                } else {
                    switch ($frequency) {
                        case 'daily':
                            $isDue = $lastBackup->diffInHours($now) >= 20;
                            break;
                        case 'weekly':
                            $isDue = $lastBackup->diffInDays($now) >= 6;
                            break;
                        case 'monthly':
                            $isDue = $lastBackup->diffInDays($now) >= 27;
                            break;
                        default:
                            $isDue = $lastBackup->diffInDays($now) >= 6;
                    }
                }
            }

            if (!$isDue) {
                $this->line("Tenant [{$tenantId}] belum waktunya backup ({$setting->auto_backup_frequency}). Terakhir: " . ($setting->last_auto_backup_at ?? '-'));
                $skippedCount++;
                continue;
            }

            $format    = $setting->auto_backup_format ?: 'excel';
            $storeName = $tenant->name ?? 'Usaha Jasa';
            $date      = $now->format('Ymd_His');

            $this->info("Menghasilkan backup ({$format}) untuk Tenant: {$storeName} ({$tenantId}) -> {$email}...");

            $tempPath = null;

            try {
                if ($format === 'excel' || $format === 'xlsx') {
                    $filename = "backup_jasa_{$tenantId}_{$date}.xlsx";
                    $tempPath = 'temp/' . $filename;

                    Excel::store(new JasaStoreBackupExport($tenantId), $tempPath, 'local');

                    Mail::raw(
                        "Halo,\n\nTerlampir adalah file Backup Otomatis Terjadwal ({$setting->auto_backup_frequency}) dalam format Microsoft Excel (.xlsx) untuk usaha jasa {$storeName} (ID: {$tenantId}) yang dibuat pada {$now->translatedFormat('d F Y H:i')} WIB.\n\nFile ini berisi beberapa Sheet:\n- Surat Perintah Kerja (SPK)\n- Katalog Layanan & Tarif\n- Stok Suku Cadang & Material\n- Tim Teknisi & Pekerja\n- Kontrak Kerja & SLA\n- Keuangan & Pengeluaran\n- Profil & Pengaturan Jasa\n\nSalam,\nTim Bizora Platform",
                        function ($message) use ($email, $tempPath, $filename, $storeName, $now) {
                            $message->to($email)
                                    ->subject("📊 Backup Otomatis (Excel) - {$storeName} (" . $now->format('d/m/Y') . ")")
                                    ->attach(storage_path('app/' . $tempPath), [
                                        'as'   => $filename,
                                        'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    ]);
                        }
                    );
                } else {
                    $filename    = "backup_jasa_{$tenantId}_{$date}.json";
                    $tempPath    = 'temp/' . $filename;
                    $data        = JasaBackupController::getBackupDataForTenant($tenantId);
                    $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                    Storage::disk('local')->put($tempPath, $jsonContent);

                    Mail::raw(
                        "Halo,\n\nTerlampir adalah file Backup Otomatis Terjadwal ({$setting->auto_backup_frequency}) dalam format JSON untuk usaha jasa {$storeName} (ID: {$tenantId}) yang dibuat pada {$now->translatedFormat('d F Y H:i')} WIB.\n\nSimpan file ini sebagai arsip data Anda.\n\nSalam,\nTim Bizora Platform",
                        function ($message) use ($email, $tempPath, $filename, $storeName, $now) {
                            $message->to($email)
                                    ->subject("📦 Backup Otomatis (JSON) - {$storeName} (" . $now->format('d/m/Y') . ")")
                                    ->attach(storage_path('app/' . $tempPath), [
                                        'as'   => $filename,
                                        'mime' => 'application/json',
                                    ]);
                        }
                    );
                }

                if ($tempPath && Storage::disk('local')->exists($tempPath)) {
                    Storage::disk('local')->delete($tempPath);
                }

                $setting->update(['last_auto_backup_at' => $now]);

                $this->info("✓ Berhasil mengirim backup ({$format}) ke {$email}");
                $sentCount++;
            } catch (\Exception $e) {
                $this->error("✗ Gagal mengirim backup untuk tenant {$tenantId}: " . $e->getMessage());
                if ($tempPath && Storage::disk('local')->exists($tempPath)) {
                    Storage::disk('local')->delete($tempPath);
                }
            }
        }

        $this->info("Selesai. Terkirim: {$sentCount}, Dilewati: {$skippedCount}.");
        return 0;
    }
}
