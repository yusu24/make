<?php

namespace App\Imports;

use App\Models\RetailProduct;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RetailProductsImport implements ToModel, WithHeadingRow
{
    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function model(array $row)
    {
        // Require at least a name and SKU
        if (!isset($row['nama_produk']) && !isset($row['sku_barcode'])) {
            return null;
        }

        $sku = $row['sku_barcode'] ?? uniqid('SKU-');
        $name = $row['nama_produk'] ?? 'Produk Baru';
        
        // Find existing or create new
        $product = RetailProduct::where('user_id', $this->userId)
            ->where('sku', $sku)
            ->first();

        if ($product) {
            $product->name = $name;
            $product->unit = $row['satuan_dasar'] ?? $product->unit;
            $product->stock = isset($row['stok_awal']) ? floatval($row['stok_awal']) : $product->stock;
            $product->stock_min = isset($row['stok_minimum']) ? floatval($row['stok_minimum']) : $product->stock_min;
            $product->price_sell = isset($row['harga_jual']) ? floatval($row['harga_jual']) : $product->price_sell;
            if (isset($row['kategori_id_opsional'])) {
                $product->category_id = $row['kategori_id_opsional'];
            }
            $product->save();
            return null; // Already saved
        }

        return new RetailProduct([
            'user_id' => $this->userId,
            'sku' => $sku,
            'name' => $name,
            'unit' => $row['satuan_dasar'] ?? 'Pcs',
            'stock' => isset($row['stok_awal']) ? floatval($row['stok_awal']) : 0,
            'stock_min' => isset($row['stok_minimum']) ? floatval($row['stok_minimum']) : 5,
            'price_sell' => isset($row['harga_jual']) ? floatval($row['harga_jual']) : 0,
            'category_id' => $row['kategori_id_opsional'] ?? null,
            'is_consignment' => false,
            'price_buy' => 0
        ]);
    }
}
