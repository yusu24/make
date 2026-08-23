<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
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
    private function getBackupData(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id');
        
        $data = [
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
        
        return $data;
    }

    public function download(Request $request)
    {
        $data = $this->getBackupData($request);
        $tenantId = $request->attributes->get('tenant_id');
        $date = Carbon::now()->format('Ymd_His');
        $filename = "backup_retail_{$tenantId}_{$date}.json";

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function email(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $data = $this->getBackupData($request);
        $tenantId = $request->attributes->get('tenant_id');
        $date = Carbon::now()->format('Ymd_His');
        $filename = "backup_retail_{$tenantId}_{$date}.json";
        
        $jsonContent = json_encode($data, JSON_PRETTY_PRINT);
        $tempPath = 'temp/' . $filename;
        Storage::disk('local')->put($tempPath, $jsonContent);

        $email = $request->email;
        
        try {
            Mail::raw("Terlampir adalah backup data Retail toko Anda yang di-generate pada {$date}.", function ($message) use ($email, $tempPath, $filename) {
                $message->to($email)
                        ->subject('Backup Data Retail - Bizora')
                        ->attach(storage_path('app/' . $tempPath), [
                            'as' => $filename,
                            'mime' => 'application/json'
                        ]);
            });

            // Clean up
            Storage::disk('local')->delete($tempPath);

            return response()->json(['success' => true, 'message' => 'Backup berhasil dikirim ke email ' . $email]);
        } catch (\Exception $e) {
            // Clean up
            if (Storage::disk('local')->exists($tempPath)) {
                Storage::disk('local')->delete($tempPath);
            }
            return response()->json(['success' => false, 'message' => 'Gagal mengirim email: ' . $e->getMessage()], 500);
        }
    }
}
