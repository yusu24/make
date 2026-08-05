<?php

namespace App\Services\Omnichannel;

class DummyMarketplaceService implements MarketplaceServiceInterface
{
    public function connect(array $credentials): bool
    {
        // Simulate API call to connect
        return true;
    }

    public function getProducts(): array
    {
        // Simulate fetching products from marketplace
        return [
            ['id' => '123', 'sku' => 'SKU-001', 'name' => 'Kemeja Polos', 'price' => 150000],
        ];
    }

    public function syncProduct(string $marketplaceProductId, array $data): bool
    {
        // Simulate pushing data (e.g. stock, price) to marketplace
        return true;
    }

    public function getOrders(): array
    {
        // Simulate fetching orders from marketplace
        return [
            ['order_id' => 'INV-123', 'status' => 'paid', 'total' => 200000],
        ];
    }
}
