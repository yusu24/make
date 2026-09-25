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

        // Extract order_id / invoice_number (Support DOKU, Midtrans, Xendit, Tripay)
        $invoiceNumber = $request->order_id 
            ?? $request->merchant_ref 
            ?? $request->invoice_number 
            ?? $request->input('order.invoice_number') 
            ?? $request->input('order.invoiceNumber') 
            ?? $request->id;

        $transactionStatus = $request->transaction_status 
            ?? $request->status 
            ?? $request->input('transaction.status') 
            ?? $request->input('result.status') 
            ?? 'settlement';

        $paymentType = $request->payment_type 
            ?? $request->payment_method 
            ?? $request->input('channel.id') 
            ?? $request->input('service.id') 
            ?? 'DOKU';

        if (!$invoiceNumber) {
            return response()->json(['success' => false, 'message' => 'Invalid payload: missing invoice/order ID.'], 400);
        }

        // --- CRYPTOGRAPHIC SIGNATURE VERIFICATION ---
        $settings = LandingSetting::first();
        $isProduction = (bool) ($settings?->payment_is_production ?? false);
        $serverKey = $settings?->payment_server_key ?: config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', ''));

        if ($request->has('signature_key')) {
            // Midtrans SHA-512 Verification
            $orderId = $invoiceNumber;
            $statusCode = (string) ($request->status_code ?? '200');
            $grossAmount = (string) ($request->gross_amount ?? '');
            $incomingSignature = (string) $request->signature_key;

            if (!empty($serverKey)) {
                $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
                if (!hash_equals($expectedSignature, $incomingSignature)) {
                    Log::warning("Fraud Webhook Attempt Detected: Invalid Midtrans signature for invoice {$invoiceNumber}");
                    return response()->json(['success' => false, 'message' => 'Unauthorized: Invalid cryptographic signature.'], 403);
                }
            }
        } elseif ($request->hasHeader('x-callback-signature') || $request->hasHeader('X-Callback-Signature')) {
            // Tripay HMAC SHA-256 Verification
            $incomingSignature = (string) ($request->header('x-callback-signature') ?? $request->header('X-Callback-Signature'));
            if (!empty($serverKey)) {
                $expectedSignature = hash_hmac('sha256', $request->getContent(), $serverKey);
                if (!hash_equals($expectedSignature, $incomingSignature)) {
                    Log::warning("Fraud Webhook Attempt Detected: Invalid Tripay signature for invoice {$invoiceNumber}");
                    return response()->json(['success' => false, 'message' => 'Unauthorized: Invalid callback signature.'], 403);
                }
            }
        } elseif ($request->hasHeader('x-callback-token') || $request->hasHeader('X-Callback-Token')) {
            // Xendit Callback Token Verification
            $incomingToken = (string) ($request->header('x-callback-token') ?? $request->header('X-Callback-Token'));
            if (!empty($serverKey) && !hash_equals((string) $serverKey, $incomingToken)) {
                Log::warning("Fraud Webhook Attempt Detected: Invalid Xendit token for invoice {$invoiceNumber}");
                return response()->json(['success' => false, 'message' => 'Unauthorized: Invalid callback token.'], 403);
            }
        } elseif ($isProduction) {
            // Enforce fail-closed policy in production environment
            Log::warning("Unauthorized Webhook Attempt: Missing signature header in production for invoice {$invoiceNumber}");
            return response()->json(['success' => false, 'message' => 'Unauthorized: Missing required signature verification headers in production.'], 403);
        } else {
            Log::info("Sandbox webhook accepted without signature for invoice {$invoiceNumber}");
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
