<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HttpWhatsAppProvider implements WhatsAppNotifierInterface
{
    public function send(string $phoneNumber, string $message): bool
    {
        $url = config('services.whatsapp.api_url');
        $token = config('services.whatsapp.api_token');

        if (!$url || !$token) {
            Log::warning('[WhatsApp:Http] WHATSAPP_API_URL/WHATSAPP_API_TOKEN belum dikonfigurasi, pesan dibatalkan.');

            return false;
        }

        try {
            $response = Http::withToken($token)->post($url, [
                'phone' => $phoneNumber,
                'message' => $message,
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('[WhatsApp:Http] Gagal mengirim pesan: ' . $e->getMessage());

            return false;
        }
    }
}
