<?php

namespace App\Services\Omnichannel;

class DummyShippingService implements ShippingServiceInterface
{
    public function requestPickup(string $orderId, array $details): bool
    {
        // Simulate API call to courier
        return true;
    }

    public function trackShipment(string $awb): array
    {
        // Simulate fetching tracking status
        return [
            'awb' => $awb,
            'status' => 'Delivered',
            'history' => [
                ['time' => '2026-10-12 10:00:00', 'desc' => 'Picked up by courier'],
                ['time' => '2026-10-13 14:00:00', 'desc' => 'Delivered to customer'],
            ]
        ];
    }

    public function getShippingLabel(string $orderId): string
    {
        // Simulate returning a URL to PDF label
        return 'https://dummy-shipping.com/label/' . $orderId . '.pdf';
    }
}
