<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminInvoiceSettingController extends Controller
{
    private string $storagePath = 'invoice_settings.json';

    public static function getInvoiceSettings(): array
    {
        $default = [
            'company_name'         => 'BIZORA SaaS',
            'company_tagline'      => 'Sistem Manajemen Usaha & Kasir Terintegrasi',
            'company_address'      => 'Jl. Jendral Sudirman No. 123, Jakarta Selatan',
            'company_phone'        => '0812-3456-7890',
            'company_email'        => 'billing@bizora.id',
            'bank_name'            => 'Bank Mandiri',
            'bank_account_number'  => '123-00-9988776-5',
            'bank_account_name'    => 'PT BIZORA TEKNOLOGI INDONESIA',
            'payment_notes'        => 'Mohon cantumkan ID Tenant saat melakukan konfirmasi pembayaran.',
            'invoice_terms'        => 'Terima kasih atas kepercayaan Anda menggunakan BIZORA SaaS. Faktur ini sah secara elektronik.',
            'email_subject'        => 'Tagihan / Invoice Langganan BIZORA ({tenant_id})',
            'email_body_template'  => "Halo {tenant_name},\n\nBerikut adalah rincian tagihan/invoice langganan paket BIZORA SaaS Anda:\n--------------------------------------------------\nID Tenant : {tenant_id}\nPaket     : {plan}\nJumlah    : Rp {amount}\nStatus    : {status}\n--------------------------------------------------\n\nMohon lakukan pembayaran untuk menyelesaikan atau memperbarui status paket langganan Anda.\n\nTerima kasih,\nTim BIZORA SaaS",
        ];

        if (Storage::exists('invoice_settings.json')) {
            $json = Storage::get('invoice_settings.json');
            $data = json_decode($json, true);
            if (is_array($data)) {
                return array_merge($default, $data);
            }
        }

        return $default;
    }

    public function get()
    {
        $settings = self::getInvoiceSettings();
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'company_name'        => 'required|string',
            'company_email'       => 'nullable|email',
            'bank_name'           => 'required|string',
            'bank_account_number' => 'required|string',
            'bank_account_name'   => 'required|string',
        ]);

        $settings = array_merge(self::getInvoiceSettings(), $request->only([
            'company_name',
            'company_tagline',
            'company_address',
            'company_phone',
            'company_email',
            'bank_name',
            'bank_account_number',
            'bank_account_name',
            'payment_notes',
            'invoice_terms',
            'email_subject',
            'email_body_template',
        ]));

        Storage::put($this->storagePath, json_encode($settings, JSON_PRETTY_PRINT));

        ActivityLog::record('update_invoice_settings', 'Memperbarui Pengaturan Invoice & Tagihan', 'info');

        return response()->json(['success' => true, 'message' => 'Pengaturan Invoice & Tagihan berhasil disimpan', 'data' => $settings]);
    }
}
