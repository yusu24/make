<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BudidayaStoreBackupExport;
use App\Models\BudidayaSetting;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHealth;
use App\Models\BudidayaSampling;
use App\Models\BudidayaInventory;
use App\Models\BudidayaExpense;
use App\Models\BudidayaStaff;
use App\Models\BudidayaSpecies;
use App\Models\BudidayaFeedStock;

class BudidayaBackupController extends Controller
{
    /**
     * Build full structured JSON backup for a Budidaya tenant.
     */
    public static function getBackupDataForTenant($tenantId): array
    {
        return [
            'tenant_id'    => $tenantId,
            'generated_at' => Carbon::now()->toIso8601String(),
            'module'       => 'budidaya',
            'settings'     => BudidayaSetting::where('tenant_id', $tenantId)->first(),
            'ponds'        => BudidayaPond::where('tenant_id', $tenantId)->get(),
            'cycles'       => BudidayaCycle::where('tenant_id', $tenantId)->latest('id')->get(),
            'harvests'     => BudidayaHarvest::where('tenant_id', $tenantId)->latest('id')->get(),
            'feedings'     => BudidayaFeeding::where('tenant_id', $tenantId)->latest('id')->get(),
            'health_logs'  => BudidayaHealth::where('tenant_id', $tenantId)->latest('id')->get(),
            'samplings'    => BudidayaSampling::where('tenant_id', $tenantId)->latest('id')->get(),
            'inventory'    => BudidayaInventory::where('tenant_id', $tenantId)->get(),
            'expenses'     => BudidayaExpense::where('tenant_id', $tenantId)->latest('id')->get(),
            'staff'        => BudidayaStaff::where('tenant_id', $tenantId)->get(),
            'species'      => BudidayaSpecies::where('tenant_id', $tenantId)->get(),
            'feed_stocks'  => BudidayaFeedStock::where('tenant_id', $tenantId)->get(),
        ];
    }

    /**
     * GET /api/budidaya/settings/backup/config
     */
    public function getSettings(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');

        $setting = BudidayaSetting::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'auto_backup_enabled'   => false,
                'auto_backup_frequency' => 'weekly',
                'auto_backup_format'    => 'excel',
            ]
        );

        $defaultEmail = $request->user()->email;

        return response()->json([
            'success' => true,
            'data'    => [
                'auto_backup_enabled'   => (bool)($setting->auto_backup_enabled ?? false),
                'auto_backup_frequency' => $setting->auto_backup_frequency ?? 'weekly',
                'auto_backup_format'    => $setting->auto_backup_format ?? 'excel',
                'auto_backup_email'     => $setting->auto_backup_email ?? $defaultEmail,
                'last_auto_backup_at'   => isset($setting->last_auto_backup_at) && $setting->last_auto_backup_at
                    ? Carbon::parse($setting->last_auto_backup_at)->toIso8601String()
                    : null,
            ],
        ]);
    }

    /**
     * POST /api/budidaya/settings/backup/config
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'auto_backup_enabled'   => 'required|boolean',
            'auto_backup_frequency' => 'required|in:daily,weekly,monthly',
            'auto_backup_format'    => 'required|in:excel,json',
            'auto_backup_email'     => 'nullable|email',
        ]);

        $tenantId = $request->attributes->get('tenant_id');
        $setting  = BudidayaSetting::firstOrCreate(['tenant_id' => $tenantId]);

        $setting->update([
            'auto_backup_enabled'   => $request->auto_backup_enabled,
            'auto_backup_frequency' => $request->auto_backup_frequency,
            'auto_backup_format'    => $request->auto_backup_format,
            'auto_backup_email'     => $request->auto_backup_email ?: $request->user()->email,
        ]);

        $setting->fresh();

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan backup otomatis berhasil disimpan.',
            'data'    => [
                'auto_backup_enabled'   => (bool)$setting->auto_backup_enabled,
                'auto_backup_frequency' => $setting->auto_backup_frequency,
                'auto_backup_format'    => $setting->auto_backup_format,
                'auto_backup_email'     => $setting->auto_backup_email,
                'last_auto_backup_at'   => $setting->last_auto_backup_at
                    ? Carbon::parse($setting->last_auto_backup_at)->toIso8601String()
                    : null,
            ],
        ]);
    }

    /**
     * GET /api/budidaya/settings/backup/download?format=excel|json
     */
    public function download(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $format   = $request->query('format', 'excel');
        $date     = Carbon::now()->format('Ymd_His');

        if ($format === 'excel' || $format === 'xlsx') {
            $filename = "backup_budidaya_{$tenantId}_{$date}.xlsx";
            return Excel::download(new BudidayaStoreBackupExport($tenantId), $filename);
        }

        $data     = self::getBackupDataForTenant($tenantId);
        $filename = "backup_budidaya_{$tenantId}_{$date}.json";

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * POST /api/budidaya/settings/backup/email
     */
    public function email(Request $request)
    {
        $request->validate([
            'email'  => 'required|email',
            'format' => 'nullable|in:excel,json',
        ]);

        $tenantId = $request->attributes->get('tenant_id');
        $format   = $request->input('format', 'excel');
        $date     = Carbon::now()->format('Ymd_His');
        $email    = $request->email;

        try {
            if ($format === 'excel' || $format === 'xlsx') {
                $filename = "backup_budidaya_{$tenantId}_{$date}.xlsx";
                $tempPath = 'temp/' . $filename;

                Excel::store(new BudidayaStoreBackupExport($tenantId), $tempPath, 'local');

                Mail::raw(
                    "Halo,\n\nTerlampir adalah file Backup Data Budidaya Ikan (Excel) yang dibuat pada " . Carbon::now()->translatedFormat('d F Y H:i') . " WIB.\n\nFile ini berisi 8 Sheet: Kolam/Tambak, Siklus Budidaya, Data Panen, Jadwal Pakan, Log Kesehatan, Inventaris & Pakan, Keuangan & Pengeluaran, serta Profil & Pengaturan Farm.\n\nSalam,\nBizora Platform",
                    function ($message) use ($email, $tempPath, $filename) {
                        $message->to($email)
                                ->subject('Backup Data Budidaya Ikan (Excel) - Bizora')
                                ->attach(storage_path('app/' . $tempPath), [
                                    'as'   => $filename,
                                    'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                ]);
                    }
                );

                if (Storage::disk('local')->exists($tempPath)) {
                    Storage::disk('local')->delete($tempPath);
                }

                return response()->json(['success' => true, 'message' => "Backup Excel berhasil dikirim ke {$email}"]);
            }

            // JSON
            $filename    = "backup_budidaya_{$tenantId}_{$date}.json";
            $data        = self::getBackupDataForTenant($tenantId);
            $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $tempPath    = 'temp/' . $filename;

            Storage::disk('local')->put($tempPath, $jsonContent);

            Mail::raw(
                "Halo,\n\nTerlampir adalah file Backup Data Budidaya Ikan (JSON) yang dibuat pada " . Carbon::now()->translatedFormat('d F Y H:i') . " WIB.\n\nSimpan file ini sebagai arsip data farm Anda.\n\nSalam,\nBizora Platform",
                function ($message) use ($email, $tempPath, $filename) {
                    $message->to($email)
                            ->subject('Backup Data Budidaya Ikan (JSON) - Bizora')
                            ->attach(storage_path('app/' . $tempPath), [
                                'as'   => $filename,
                                'mime' => 'application/json',
                            ]);
                }
            );

            if (Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }

            return response()->json(['success' => true, 'message' => "Backup JSON berhasil dikirim ke {$email}"]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email backup: ' . $e->getMessage(),
            ], 500);
        }
    }
}
