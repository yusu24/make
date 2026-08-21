<?php

namespace App\Services;

use App\Models\LandingSetting;
use App\Models\Tenant;
use App\Models\TenantInvoice;
use App\Models\SubscriptionRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    /**
     * Create an invoice / checkout session for subscription upgrade.
     */
    public static function createInvoice(Tenant $tenant, string $planKey, float $amount, int $months = 1): array
    {
        $invoiceNumber = 'INV-' . strtoupper(date('Ymd')) . '-' . strtoupper(Str::random(6));
        $dueDate = now()->addDays(3);

        // 1. Create or retrieve invoice in DB
        $invoice = TenantInvoice::create([
            'id'             => $invoiceNumber,
            'tenant_id'      => $tenant->tenant_id,
            'plan'           => ucfirst($planKey),
            'amount'         => $amount,
            'status'         => 'unpaid',
            'date'           => now(),
            'due_date'       => $dueDate,
            'payment_method' => 'payment_gateway',
        ]);

        // 2. Prepare mock / sandbox payment payload with QRIS & Virtual Account details
        $vaNumberBca = '8800' . str_pad((string) rand(10000000, 99999999), 10, '0', STR_PAD_LEFT);
        $vaNumberMandiri = '7001' . str_pad((string) rand(10000000, 99999999), 10, '0', STR_PAD_LEFT);
        $vaNumberBri = '1234' . str_pad((string) rand(10000000, 99999999), 10, '0', STR_PAD_LEFT);

        return [
            'success'        => true,
            'invoice_number' => $invoiceNumber,
            'amount'         => $amount,
            'plan'           => ucfirst($planKey),
            'due_date'       => $dueDate->format('Y-m-d H:i:s'),
            'checkout_url'   => url("/pay/{$invoiceNumber}"),
            'payment_channels' => [
                'qris' => [
                    'name'        => 'QRIS (GoPay, OVO, Dana, ShopeePay, BCA, Mandiri)',
                    'qr_string'   => '00020101021226580016ID.BIZORA.PAY0118' . $invoiceNumber . '520458125303360540' . (int)$amount . '5802ID5910BIZORA PAY6007JAKARTA6304',
                    'expiry'      => $dueDate->diffForHumans(),
                ],
                'virtual_accounts' => [
                    ['bank' => 'BCA', 'va_number' => $vaNumberBca, 'name' => 'BIZORA - ' . ($tenant->business_name ?? $tenant->name)],
                    ['bank' => 'Mandiri', 'va_number' => $vaNumberMandiri, 'name' => 'BIZORA - ' . ($tenant->business_name ?? $tenant->name)],
                    ['bank' => 'BRI', 'va_number' => $vaNumberBri, 'name' => 'BIZORA - ' . ($tenant->business_name ?? $tenant->name)],
                ]
            ]
        ];
    }

    /**
     * Handle payment settlement: activate tenant plan, extend expiry, mark invoice paid.
     */
    public static function processSettlement(string $invoiceNumber, ?string $paymentMethod = 'QRIS'): array
    {
        $invoice = TenantInvoice::where('id', $invoiceNumber)->first();

        if (!$invoice) {
            return ['success' => false, 'message' => 'Invoice tidak ditemukan.'];
        }

        if ($invoice->status === 'paid') {
            return ['success' => true, 'message' => 'Invoice sudah berstatus lunas sebelumnya.'];
        }

        // Mark invoice as paid
        $invoice->update([
            'status'         => 'paid',
            'payment_method' => $paymentMethod ?? 'Payment Gateway',
        ]);

        // Find tenant and update subscription
        $tenant = Tenant::where('tenant_id', $invoice->tenant_id)->first();
        if ($tenant) {
            $currentExpires = ($tenant->subscription_expires_at && $tenant->subscription_expires_at->isFuture())
                ? $tenant->subscription_expires_at
                : now();

            $newExpires = $currentExpires->copy()->addDays(30);

            $tenant->update([
                'plan'                    => strtolower($invoice->plan),
                'subscription_status'     => 'active',
                'subscription_expires_at' => $newExpires,
            ]);

            // Update pending SubscriptionRequest if exists
            SubscriptionRequest::where('tenant_id', $tenant->tenant_id)
                ->where('status', 'pending')
                ->update([
                    'status'      => 'approved',
                    'approved_at' => now(),
                ]);

            // Notify Tenant
            $owner = $tenant->owner;
            if ($owner) {
                \App\Models\Notification::create([
                    'user_id' => $owner->id,
                    'type'    => 'success',
                    'title'   => 'Pembayaran Langganan Berhasil! 🎉',
                    'message' => "Paket {$invoice->plan} Anda telah aktif hingga " . $newExpires->format('d M Y') . ". Terima kasih atas kepercayaan Anda!",
                    'data'    => ['invoice_id' => $invoice->id, 'link' => '/subscription']
                ]);
            }
        }

        return [
            'success' => true,
            'message' => "Invoice {$invoiceNumber} berhasil diselesaikan. Langganan aktif!",
            'invoice' => $invoice,
        ];
    }
}
