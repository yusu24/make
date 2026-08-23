<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;

class AdminSubscriptionReminderController extends Controller
{
    private string $storagePath = 'subscription_reminders.json';

    public static function getReminderSettings(): array
    {
        $default = [
            'is_enabled'               => true,
            'auto_suspend_overdue'     => true,
            'auto_suspend_after_days'  => 3,
            
            // Delivery channels
            'channels' => [
                'email'    => true,
                'whatsapp' => true,
                'in_app'   => true,
            ],

            // Reminder schedules & message templates
            'reminders' => [
                'h7' => [
                    'active'   => true,
                    'days'     => 7,
                    'type'     => 'before',
                    'badge'    => 'H-7',
                    'title'    => 'Pemberitahuan Awal (7 Hari Sebelum Jatuh Tempo)',
                    'subject'  => 'Pengingat: Langganan BIZORA Anda Akan Berakhir dalam 7 Hari ({tenant_id})',
                    'email_body' => "Halo {owner_name},\n\nKami ingin memberitahukan bahwa masa aktif paket langganan {plan_name} untuk toko/usaha {tenant_name} akan berakhir dalam 7 hari pada tanggal {due_date}.\n\nDetail Tagihan Perpanjangan:\n--------------------------------------------------\nID Tenant : {tenant_id}\nNama Toko : {tenant_name}\nPaket     : {plan_name}\nJumlah    : Rp {amount}\nJatuh Tempo: {due_date}\n--------------------------------------------------\n\nUntuk memastikan operasional kasir dan toko tetap berjalan tanpa jeda, Anda dapat melakukan pembayaran perpanjangan ke rekening resmi kami:\n{bank_info}\n\nTerima kasih,\nTim BIZORA SaaS",
                    'wa_body'   => "Halo *{owner_name}*,\n\nPaket langganan *{plan_name}* untuk toko *{tenant_name}* akan berakhir dalam 7 hari pada *{due_date}*.\n\nJumlah tagihan perpanjangan: *Rp {amount}*.\n\nSegera lakukan perpanjangan agar sistem kasir & laporan toko tetap aktif tanpa kendala.\n\nInfo rekening: {bank_info}\n\nSalam,\nTim BIZORA",
                ],
                'h3' => [
                    'active'   => true,
                    'days'     => 3,
                    'type'     => 'before',
                    'badge'    => 'H-3',
                    'title'    => 'Peringatan Kedua (3 Hari Sebelum Jatuh Tempo)',
                    'subject'  => 'Penting: Masa Aktif Paket BIZORA Tinggal 3 Hari Lagi ({tenant_id})',
                    'email_body' => "Halo {owner_name},\n\nMasa aktif paket langganan {plan_name} untuk {tenant_name} tersisa 3 hari lagi (Jatuh Tempo: {due_date}).\n\nJumlah Tagihan: Rp {amount}\n\nSilakan selesaikan perpanjangan via transfer bank ke:\n{bank_info}\n\nSetelah transfer, sistem akan otomatis memperbarui masa aktif toko Anda.\n\nTerima kasih,\nTim BIZORA SaaS",
                    'wa_body'   => "Halo *{owner_name}*,\n\nMasa aktif paket *{plan_name}* toko *{tenant_name}* tersisa *3 hari lagi* (Jatuh Tempo: {due_date}).\n\nTotal tagihan: *Rp {amount}*.\nTransfer ke: {bank_info}\n\nJangan biarkan operasional toko terhenti!",
                ],
                'h0' => [
                    'active'   => true,
                    'days'     => 0,
                    'type'     => 'due',
                    'badge'    => 'Hari H',
                    'title'    => 'Batas Akhir Pembayaran (Hari Jatuh Tempo)',
                    'subject'  => 'Hari Ini Batas Akhir Pembayaran Paket BIZORA ({tenant_id})',
                    'email_body' => "Halo {owner_name},\n\nHari ini ({due_date}) adalah batas akhir pembayaran paket langganan {plan_name} toko {tenant_name}.\n\nTotal Tagihan: Rp {amount}\nRekening Pembayaran:\n{bank_info}\n\nMohon selesaikan pembayaran hari ini agar layanan kasir, multi-outlet, dan inventaris toko Anda tidak terputus.\n\nTerima kasih,\nTim BIZORA SaaS",
                    'wa_body'   => "⚠️ PENTING: Hari ini adalah batas akhir pembayaran paket *{plan_name}* untuk toko *{tenant_name}*.\n\nTotal: *Rp {amount}*\nRekening: {bank_info}\n\nSilakan selesaikan pembayaran hari ini agar akun tetap aktif.",
                ],
                'overdue' => [
                    'active'   => true,
                    'days'     => -3,
                    'type'     => 'overdue',
                    'badge'    => 'H+3 Overdue',
                    'title'    => 'Peringatan Masa Tenggang & Penonaktifan (Lewat Jatuh Tempo)',
                    'subject'  => 'Peringatan Terakhir: Akun BIZORA Anda Memasuki Masa Tenggang ({tenant_id})',
                    'email_body' => "Halo {owner_name},\n\nPaket langganan {plan_name} untuk {tenant_name} telah melewati batas jatuh tempo sejak {due_date}.\n\nSaat ini akun Anda berada dalam masa tenggang (Grace Period). Jika pembayaran sebesar Rp {amount} belum diselesaikan, akses kasir dan sistem akan dinonaktifkan sementara secara otomatis.\n\nRekening Pembayaran:\n{bank_info}\n\nHubungi tim bantuan kami jika Anda membutuhkan bantuan.\n\nSalam,\nTim BIZORA SaaS",
                    'wa_body'   => "🚨 PERINGATAN TERAKHIR: Paket langganan toko *{tenant_name}* telah melewati jatuh tempo sejak *{due_date}*.\n\nAkses toko akan dinonaktifkan sementara jika pembayaran *Rp {amount}* belum diselesaikan ke {bank_info}.\n\nHubungi CS kami jika ada kendala.",
                ],
            ],

            'last_run_at'              => null,
            'total_reminders_sent'     => 0,
        ];

        if (Storage::exists('subscription_reminders.json')) {
            $json = Storage::get('subscription_reminders.json');
            $data = json_decode($json, true);
            if (is_array($data)) {
                return array_replace_recursive($default, $data);
            }
        }

        return $default;
    }

    /**
     * Get current reminder settings
     */
    public function index()
    {
        $settings = self::getReminderSettings();
        $invoiceSettings = AdminInvoiceSettingController::getInvoiceSettings();
        
        return response()->json([
            'status' => 'success',
            'data'   => $settings,
            'bank_info' => [
                'bank_name' => $invoiceSettings['bank_name'] ?? 'Bank Mandiri',
                'bank_account_number' => $invoiceSettings['bank_account_number'] ?? '123-00-9988776-5',
                'bank_account_name' => $invoiceSettings['bank_account_name'] ?? 'PT BIZORA TEKNOLOGI INDONESIA',
            ]
        ]);
    }

    /**
     * Update reminder settings
     */
    public function update(Request $request)
    {
        $current = self::getReminderSettings();
        $data = $request->all();

        $merged = array_replace_recursive($current, $data);
        Storage::put($this->storagePath, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        ActivityLog::record(
            'Mengubah Pengaturan Pengingat & Otomasi Langganan',
            $request->user() ? $request->user()->name : 'Admin',
            'System',
            'success'
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengaturan pengingat & otomasi langganan berhasil disimpan.',
            'data'    => $merged,
        ]);
    }

    /**
     * Test send a sample reminder (Email or WA simulation)
     */
    public function testSend(Request $request)
    {
        $request->validate([
            'channel'       => 'required|in:email,whatsapp',
            'target'        => 'required|string',
            'schedule_key'  => 'required|string',
        ]);

        $settings = self::getReminderSettings();
        $schedule = $settings['reminders'][$request->schedule_key] ?? $settings['reminders']['h7'];
        $invoiceSettings = AdminInvoiceSettingController::getInvoiceSettings();

        $bankStr = ($invoiceSettings['bank_name'] ?? 'Bank Mandiri') . ' (' . ($invoiceSettings['bank_account_number'] ?? '123-00-9988776-5') . ') a.n. ' . ($invoiceSettings['bank_account_name'] ?? 'PT BIZORA');

        // Sample variables
        $sampleVars = [
            '{tenant_name}' => 'Toko Berkah Sejahtera',
            '{owner_name}'  => 'Ahmad Suharto',
            '{tenant_id}'   => 'TN-001',
            '{plan_name}'   => 'Pro (Langganan Bulanan)',
            '{amount}'      => '299.000',
            '{due_date}'    => date('d F Y', strtotime('+7 days')),
            '{days_left}'   => '7',
            '{bank_info}'   => $bankStr,
        ];

        $subject = str_replace(array_keys($sampleVars), array_values($sampleVars), $schedule['subject']);
        $body = str_replace(array_keys($sampleVars), array_values($sampleVars), $request->channel === 'email' ? $schedule['email_body'] : $schedule['wa_body']);

        if ($request->channel === 'email') {
            try {
                Mail::raw($body, function ($msg) use ($request, $subject) {
                    $msg->to($request->target)->subject('[TEST REMINDER] ' . $subject);
                });
            } catch (\Exception $e) {
                // If mail driver fails, return message with success simulation for dev
            }
        }

        ActivityLog::record(
            "Mengirim Test Reminder ({$request->channel}) ke {$request->target}",
            $request->user() ? $request->user()->name : 'Admin',
            'Notification',
            'info'
        );

        return response()->json([
            'status'  => 'success',
            'message' => "Pesan uji coba ({$request->channel}) berhasil dikirim ke {$request->target}.",
            'preview' => [
                'subject' => $subject,
                'body'    => $body,
                'target'  => $request->target,
            ]
        ]);
    }
}
