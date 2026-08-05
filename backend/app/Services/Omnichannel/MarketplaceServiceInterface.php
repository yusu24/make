<?php

namespace App\Services\Omnichannel;

interface MarketplaceServiceInterface
{
    /**
     * Authenticate and connect to the marketplace.
     */
    public function connect(array $credentials): bool;

    /**
     * Fetch products from the marketplace.
     */
    public function getProducts(): array;

    /**
     * Push local product updates (e.g. stock, price) to marketplace.
     */
    public function syncProduct(string $marketplaceProductId, array $data): bool;

    /**
     * Fetch new orders from the marketplace.
     */
    public function getOrders(): array;
}
