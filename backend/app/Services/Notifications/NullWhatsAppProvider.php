<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Log;

class NullWhatsAppProvider implements WhatsAppNotifierInterface
{
    public function send(string $phoneNumber, string $message): bool
    {
        Log::info("[WhatsApp:Null] Would send to {$phoneNumber}: {$message}");

        return true;
    }
}
