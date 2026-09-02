<?php

namespace App\Http\Controllers\Api\Jasa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\JasaStoreBackupExport;
use App\Models\JasaSetting;
use App\Models\JasaWorkOrder;
use App\Models\JasaServiceCatalog;
use App\Models\JasaSparepart;
use App\Models\JasaTechnician;
use App\Models\JasaContract;
use App\Models\JasaFinanceTransaction;

class JasaBackupController extends Controller
{
    /**
     * Build full structured JSON backup for a specific Jasa tenant.
     */
    public static function getBackupDataForTenant($tenantId): array
    {
        return [
            'tenant_id'    => $tenantId,
            'generated_at' => Carbon::now()->toIso8601String(),
            'module'       => 'jasa',
            'settings'     => JasaSetting::where('tenant_id', $tenantId)->first(),
            'work_orders'  => JasaWorkOrder::where('tenant_id', $tenantId)->with(['technician', 'parts', 'logs'])->latest('id')->get(),
            'services'     => JasaServiceCatalog::where('tenant_id', $tenantId)->get(),
            'spareparts'   => JasaSparepart::where('tenant_id', $tenantId)->get(),
            'technicians'  => JasaTechnician::where('tenant_id', $tenantId)->get(),
            'contracts'    => JasaContract::where('tenant_id', $tenantId)->with('technician')->get(),
            'finance'      => JasaFinanceTransaction::where('tenant_id', $tenantId)->latest('transaction_date')->get(),
        ];
    }

    /**
     * GET /api/jasa/settings/backup/config
     * Return current backup settings for the authenticated tenant.
     */
    public function getSettings(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');

        $setting = JasaSetting::firstOrCreate(
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
            'data' => [
                'auto_backup_enabled'   => (bool)$setting->auto_backup_enabled,
                'auto_backup_frequency' => $setting->auto_backup_frequency ?: 'weekly',
                'auto_backup_format'    => $setting->auto_backup_format ?: 'excel',
                'auto_backup_email'     => $setting->auto_backup_email ?: $defaultEmail,
                'last_auto_backup_at'   => $setting->last_auto_backup_at
                    ? $setting->last_auto_backup_at->toIso8601String()
                    : null,
            ]
        ]);
    }

    /**
     * POST /api/jasa/settings/backup/config
     * Save auto backup settings for the current tenant.
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
        $setting  = JasaSetting::firstOrCreate(['tenant_id' => $tenantId]);

        $setting->update([
            'auto_backup_enabled'   => $request->auto_backup_enabled,
            'auto_backup_frequency' => $request->auto_backup_frequency,
            'auto_backup_format'    => $request->auto_backup_format,
            'auto_backup_email'     => $request->auto_backup_email ?: $request->user()->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan backup otomatis berhasil disimpan.',
            'data'    => [
                'auto_backup_enabled'   => (bool)$setting->auto_backup_enabled,
                'auto_backup_frequency' => $setting->auto_backup_frequency,
                'auto_backup_format'    => $setting->auto_backup_format,
                'auto_backup_email'     => $setting->auto_backup_email,
                'last_auto_backup_at'   => $setting->last_auto_backup_at
                    ? $setting->last_auto_backup_at->toIso8601String()
                    : null,
            ]
        ]);
    }

    /**
     * GET /api/jasa/settings/backup/download?format=excel|json
     * Download backup file directly.
     */
    public function download(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $format   = $request->query('format', 'excel');
        $date     = Carbon::now()->format('Ymd_His');

        if ($format === 'excel' || $format === 'xlsx') {
            $filename = "backup_jasa_{$tenantId}_{$date}.xlsx";
            return Excel::download(new JasaStoreBackupExport($tenantId), $filename);
        }

        // JSON format
        $data     = self::getBackupDataForTenant($tenantId);
        $filename = "backup_jasa_{$tenantId}_{$date}.json";

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * POST /api/jasa/settings/backup/email
     * Send backup via email on-demand.
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
                $filename = "backup_jasa_{$tenantId}_{$date}.xlsx";
                $tempPath = 'temp/' . $filename;

                Excel::store(new JasaStoreBackupExport($tenantId), $tempPath, 'local');

                Mail::raw(
                    "Halo,\n\nTerlampir adalah file Backup Data Jasa & Servis (Excel) toko Anda yang dibuat pada " . Carbon::now()->translatedFormat('d F Y H:i') . " WIB.\n\nFile ini berisi 7 Sheet: Surat Perintah Kerja (SPK), Katalog Layanan, Stok Suku Cadang, Tim Teknisi, Kontrak Kerja & SLA, Keuangan, serta Profil & Pengaturan Jasa.\n\nSalam,\nBizora Platform",
                    function ($message) use ($email, $tempPath, $filename) {
                        $message->to($email)
                                ->subject('Backup Data Jasa (Excel) - Bizora')
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
            $filename    = "backup_jasa_{$tenantId}_{$date}.json";
            $data        = self::getBackupDataForTenant($tenantId);
            $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $tempPath    = 'temp/' . $filename;

            Storage::disk('local')->put($tempPath, $jsonContent);

            Mail::raw(
                "Halo,\n\nTerlampir adalah file Backup Data Jasa (JSON) yang dibuat pada " . Carbon::now()->translatedFormat('d F Y H:i') . " WIB.\n\nSimpan file ini sebagai arsip data Anda.\n\nSalam,\nBizora Platform",
                function ($message) use ($email, $tempPath, $filename) {
                    $message->to($email)
                            ->subject('Backup Data Jasa (JSON) - Bizora')
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
            if (isset($tempPath) && Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }
            return response()->json(['success' => false, 'message' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
        }
    }
}
