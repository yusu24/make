<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RetailStoreBackupExport;
use App\Models\RetailCategory;
use App\Models\RetailProduct;
use App\Models\RetailTransaction;
use App\Models\RetailCustomer;
use App\Models\RetailSupplier;
use App\Models\RetailSetting;
use App\Models\RetailOutlet;
use App\Models\User;

class RetailBackupController extends Controller
{
    /**
     * Get full structured backup dataset for a specific tenant (JSON format).
     */
    public static function getBackupDataForTenant($tenantId)
    {
        return [
            'tenant_id' => $tenantId,
            'generated_at' => Carbon::now()->toIso8601String(),
            'module' => 'retail',
            'settings' => RetailSetting::where('tenant_id', $tenantId)->first(),
            'categories' => RetailCategory::where('tenant_id', $tenantId)->get(),
            'outlets' => RetailOutlet::where('tenant_id', $tenantId)->get(),
            'products' => RetailProduct::where('tenant_id', $tenantId)->with(['units', 'batches', 'serials', 'stock_movements'])->get(),
            'customers' => RetailCustomer::where('tenant_id', $tenantId)->get(),
            'suppliers' => RetailSupplier::where('tenant_id', $tenantId)->get(),
            'transactions' => RetailTransaction::where('tenant_id', $tenantId)->with(['items', 'payments'])->get(),
        ];
    }

    /**
     * Get auto backup settings for the current tenant.
     */
    public function getSettings(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $setting = RetailSetting::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'auto_backup_enabled' => false,
                'auto_backup_frequency' => 'weekly',
                'auto_backup_format' => 'excel',
            ]
        );

        $defaultEmail = $request->user()->email;

        return response()->json([
            'success' => true,
            'data' => [
                'auto_backup_enabled' => (bool)$setting->auto_backup_enabled,
                'auto_backup_frequency' => $setting->auto_backup_frequency ?: 'weekly',
                'auto_backup_format' => $setting->auto_backup_format ?: 'excel',
                'auto_backup_email' => $setting->auto_backup_email ?: $defaultEmail,
                'last_auto_backup_at' => $setting->last_auto_backup_at ? $setting->last_auto_backup_at->toIso8601String() : null,
            ]
        ]);
    }

    /**
     * Update auto backup settings for the current tenant.
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'auto_backup_enabled' => 'required|boolean',
            'auto_backup_frequency' => 'required|in:daily,weekly,monthly',
            'auto_backup_format' => 'required|in:excel,json',
            'auto_backup_email' => 'nullable|email',
        ]);

        $tenantId = $request->attributes->get('tenant_id');
        $setting = RetailSetting::firstOrCreate(['tenant_id' => $tenantId]);

        $setting->update([
            'auto_backup_enabled' => $request->auto_backup_enabled,
            'auto_backup_frequency' => $request->auto_backup_frequency,
            'auto_backup_format' => $request->auto_backup_format,
            'auto_backup_email' => $request->auto_backup_email ?: $request->user()->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan backup otomatis berhasil disimpan.',
            'data' => [
                'auto_backup_enabled' => (bool)$setting->auto_backup_enabled,
                'auto_backup_frequency' => $setting->auto_backup_frequency,
                'auto_backup_format' => $setting->auto_backup_format,
                'auto_backup_email' => $setting->auto_backup_email,
                'last_auto_backup_at' => $setting->last_auto_backup_at ? $setting->last_auto_backup_at->toIso8601String() : null,
            ]
        ]);
    }

    /**
     * Download backup file (Excel or JSON) on-demand.
     */
    public function download(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        $format = $request->query('format', 'excel');
        $date = Carbon::now()->format('Ymd_His');

        if ($format === 'excel' || $format === 'xlsx') {
            $filename = "backup_retail_{$tenantId}_{$date}.xlsx";
            return Excel::download(new RetailStoreBackupExport($tenantId), $filename);
        }

        // Default JSON
        $data = self::getBackupDataForTenant($tenantId);
        $filename = "backup_retail_{$tenantId}_{$date}.json";

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Send backup file (Excel or JSON) to specified email on-demand.
     */
    public function email(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'format' => 'nullable|in:excel,json',
        ]);

        $tenantId = $request->attributes->get('tenant_id');
        $format = $request->input('format', 'excel');
        $date = Carbon::now()->format('Ymd_His');
        $email = $request->email;

        try {
            if ($format === 'excel' || $format === 'xlsx') {
                $filename = "backup_retail_{$tenantId}_{$date}.xlsx";
                $tempPath = 'temp/' . $filename;
                
                // Store excel in local disk
                Excel::store(new RetailStoreBackupExport($tenantId), $tempPath, 'local');

                Mail::raw("Terlampir adalah file Backup Data Retail (Excel) toko Anda yang dibuat pada {$date}.", function ($message) use ($email, $tempPath, $filename) {
                    $message->to($email)
                            ->subject('Backup Data Retail (Excel) - Bizora')
                            ->attach(storage_path('app/' . $tempPath), [
                                'as' => $filename,
                                'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            ]);
                });

                if (Storage::disk('local')->exists($tempPath)) {
                    Storage::disk('local')->delete($tempPath);
                }

                return response()->json(['success' => true, 'message' => "Backup Excel berhasil dikirim ke email {$email}"]);
            }

            // JSON format
            $filename = "backup_retail_{$tenantId}_{$date}.json";
            $data = self::getBackupDataForTenant($tenantId);
            $jsonContent = json_encode($data, JSON_PRETTY_PRINT);
            $tempPath = 'temp/' . $filename;
            Storage::disk('local')->put($tempPath, $jsonContent);

            Mail::raw("Terlampir adalah backup data Retail toko Anda yang di-generate pada {$date}.", function ($message) use ($email, $tempPath, $filename) {
                $message->to($email)
                        ->subject('Backup Data Retail (JSON) - Bizora')
                        ->attach(storage_path('app/' . $tempPath), [
                            'as' => $filename,
                            'mime' => 'application/json'
                        ]);
            });

            if (Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }

            return response()->json(['success' => true, 'message' => "Backup JSON berhasil dikirim ke email {$email}"]);
        } catch (\Exception $e) {
            if (isset($tempPath) && Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }
            return response()->json(['success' => false, 'message' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
        }
    }
}
