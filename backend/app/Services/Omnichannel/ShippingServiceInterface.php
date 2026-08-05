<?php

namespace App\Services\Omnichannel;

interface ShippingServiceInterface
{
    /**
     * Request pickup for an order.
     */
    public function requestPickup(string $orderId, array $details): bool;

    /**
     * Get tracking status of a shipment.
     */
    public function trackShipment(string $awb): array;

    /**
     * Generate shipping label (resi).
     */
    public function getShippingLabel(string $orderId): string;
}
