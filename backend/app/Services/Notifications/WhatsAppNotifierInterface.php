<?php

namespace App\Services\Notifications;

interface WhatsAppNotifierInterface
{
    /**
     * Send a WhatsApp text message to the given phone number.
     * Implementations must never throw on delivery failure — they should
     * log/report the failure and return false so callers (order flows)
     * are never blocked by a notification error.
     */
    public function send(string $phoneNumber, string $message): bool;
}
