<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RetailCategory;
use App\Models\RetailUnit;
use App\Models\RetailProduct;
use App\Models\Tenant;

class RetailTestingSeeder extends Seeder
{
    public function run()
    {
        $tenant = Tenant::first();
        if (!$tenant) {
            echo "No tenant found. Please create one first.\n";
            return;
        }

        $tenantId = $tenant->id;
        echo "Seeding data for Tenant: {$tenant->name} ({$tenantId})\n";

        // 1. Units
        $units = ['Pcs', 'Box', 'Kg', 'Liter', 'Pack', 'Botol', 'Sachet'];
        foreach ($units as $u) {
            RetailUnit::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $u]
            );
        }
        echo "Created " . count($units) . " units.\n";

        // 2. Categories
        $cats = ['Makanan', 'Minuman', 'Sembako', 'Alat Tulis', 'Kebersihan'];
        $catModels = [];
        foreach ($cats as $c) {
            $catModels[$c] = RetailCategory::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $c]
            );
        }
        echo "Created " . count($cats) . " categories.\n";

        // 3. Products
        $products = [
            ['cat' => 'Makanan', 'name' => 'Keripik Singkong Balado', 'price' => 15000, 'stock' => 143, 'unit' => 'Pack'],
            ['cat' => 'Makanan', 'name' => 'Kacang Umpet Karamel', 'price' => 25000, 'stock' => 60, 'unit' => 'Pack'],
            ['cat' => 'Makanan', 'name' => 'Paket Hampers Lebaran A', 'price' => 250000, 'stock' => 13, 'unit' => 'Box'],
            ['cat' => 'Makanan', 'name' => 'Paket Hampers Lebaran B', 'price' => 320000, 'stock' => 4, 'unit' => 'Box'],
            ['cat' => 'Makanan', 'name' => 'Stick Balado Pedas', 'price' => 9000, 'stock' => 215, 'unit' => 'Pack'],
            ['cat' => 'Minuman', 'name' => 'Air Mineral 600ml', 'price' => 4000, 'stock' => 50, 'unit' => 'Botol'],
            ['cat' => 'Minuman', 'name' => 'Teh Botol Sosro', 'price' => 6000, 'stock' => 30, 'unit' => 'Botol'],
            ['cat' => 'Minuman', 'name' => 'Kopi Kapal Api', 'price' => 3000, 'stock' => 100, 'unit' => 'Sachet'],
            ['cat' => 'Sembako', 'name' => 'Beras Pandan Wangi 5kg', 'price' => 75000, 'stock' => 20, 'unit' => 'Pack'],
            ['cat' => 'Sembako', 'name' => 'Minyak Goreng Bimoli 1L', 'price' => 18000, 'stock' => 45, 'unit' => 'Liter'],
            ['cat' => 'Sembako', 'name' => 'Telur Ayam 1kg', 'price' => 28000, 'stock' => 15, 'unit' => 'Kg'],
            ['cat' => 'Alat Tulis', 'name' => 'Buku Tulis Sidu 38', 'price' => 5000, 'stock' => 100, 'unit' => 'Pcs'],
            ['cat' => 'Alat Tulis', 'name' => 'Pulpen Snowman Black', 'price' => 3500, 'stock' => 50, 'unit' => 'Pcs'],
            ['cat' => 'Kebersihan', 'name' => 'Sabun Cuci Mama Lemon', 'price' => 2000, 'stock' => 40, 'unit' => 'Pack'],
            ['cat' => 'Kebersihan', 'name' => 'Pembersih Lantai So Klin', 'price' => 12000, 'stock' => 24, 'unit' => 'Pack'],
        ];

        foreach ($products as $p) {
            RetailProduct::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => $p['name']],
                [
                    'category_id' => $catModels[$p['cat']]->id,
                    'sku' => strtoupper(substr($p['cat'], 0, 3)) . '-' . rand(1000, 9999),
                    'unit' => $p['unit'],
                    'stock' => $p['stock'],
                    'stock_min' => 10,
                    'price_buy' => $p['price'] * 0.85,
                    'price_sell' => $p['price'],
                ]
            );
        }
        echo "Created " . count($products) . " products.\n";
    }
}
