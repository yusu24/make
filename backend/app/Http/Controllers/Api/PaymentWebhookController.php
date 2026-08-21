<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingSetting;
use App\Models\TenantInvoice;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    /**
     * Public webhook callback for Payment Gateways (Midtrans / Tripay / Xendit).
     * POST /api/payment/webhook
     */
    public function handleWebhook(Request $request)
    {
        Log::info('Payment Webhook Received:', $request->all());

        // Extract order_id / invoice_number
        $invoiceNumber = $request->order_id ?? $request->merchant_ref ?? $request->invoice_number ?? $request->id;
        $transactionStatus = $request->transaction_status ?? $request->status ?? 'settlement';
        $paymentType = $request->payment_type ?? $request->payment_method ?? 'QRIS';

        if (!$invoiceNumber) {
            return response()->json(['success' => false, 'message' => 'Invalid payload: missing invoice/order ID.'], 400);
        }

        if (in_array(strtolower($transactionStatus), ['capture', 'settlement', 'paid', 'success'])) {
            $result = PaymentGatewayService::processSettlement($invoiceNumber, $paymentType);
            return response()->json($result);
        }

        return response()->json([
            'success' => true,
            'message' => "Webhook received. Status '{$transactionStatus}' not requiring settlement."
        ]);
    }

    /**
     * Instant sandbox payment simulator for tenant / admin testing.
     * POST /api/payment/simulate-pay
     */
    public function simulatePayment(Request $request)
    {
        $request->validate([
            'invoice_number' => 'required|string',
            'payment_method' => 'nullable|string',
        ]);

        $result = PaymentGatewayService::processSettlement(
            $request->invoice_number,
            $request->payment_method ?? 'QRIS (Simulasi)'
        );

        return response()->json($result);
    }

    /**
     * Get Payment Gateway Configuration (Admin SaaS).
     * GET /api/admin/payment-gateway-config
     */
    public function getConfig()
    {
        $settings = LandingSetting::first();

        return response()->json([
            'success' => true,
            'data' => [
                'provider'         => $settings->payment_provider ?? 'midtrans',
                'is_production'    => (bool) ($settings->payment_is_production ?? false),
                'merchant_id'      => $settings->payment_merchant_id ?? 'M109283-BIZORA',
                'client_key'       => $settings->payment_client_key ?? 'SB-Mid-client-88a9BcD1293',
                'server_key'       => $settings->payment_server_key ? '••••••••••••••••' : 'SB-Mid-server-99kLzP3921',
                'webhook_url'      => url('/api/payment/webhook'),
                'auto_settlement'  => true,
                'supported_channels' => ['QRIS', 'BCA Virtual Account', 'Mandiri VA', 'BRI VA', 'GoPay', 'ShopeePay']
            ]
        ]);
    }

    /**
     * Update Payment Gateway Configuration (Admin SaaS).
     * POST /api/admin/payment-gateway-config
     */
    public function updateConfig(Request $request)
    {
        $request->validate([
            'provider'      => 'nullable|string',
            'is_production' => 'nullable|boolean',
            'merchant_id'   => 'nullable|string',
            'client_key'    => 'nullable|string',
            'server_key'    => 'nullable|string',
        ]);

        $settings = LandingSetting::firstOrCreate(['id' => 1]);
        
        $settings->payment_provider      = $request->provider ?? 'midtrans';
        $settings->payment_is_production = (bool) $request->is_production;
        if ($request->filled('merchant_id')) $settings->payment_merchant_id = $request->merchant_id;
        if ($request->filled('client_key')) $settings->payment_client_key = $request->client_key;
        if ($request->filled('server_key') && !str_contains($request->server_key, '••••')) {
            $settings->payment_server_key = $request->server_key;
        }
        $settings->save();

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi Payment Gateway berhasil disimpan!'
        ]);
    }
}
