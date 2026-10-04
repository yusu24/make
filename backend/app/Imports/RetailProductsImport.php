<?php

namespace App\Imports;

use App\Models\RetailProduct;
use App\Models\RetailCategory;
use App\Models\RetailUnit;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RetailProductsImport implements ToModel, WithHeadingRow
{
    protected string $tenantId;
    protected int $createdCount = 0;
    protected int $updatedCount = 0;
    protected array $categoryCache = [];
    protected array $unitCache = [];

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function model(array $row)
    {
        // Extract Product Name
        $name = trim((string) (
            $row['nama_produk']
            ?? $row['nama']
            ?? $row['name']
            ?? $row['nama_barang']
            ?? ''
        ));

        // Skip completely empty rows
        if ($name === '' && empty($row['sku_barcode']) && empty($row['sku'])) {
            return null;
        }

        if ($name === '') {
            $name = 'Produk Baru';
        }

        // Extract SKU / Barcode
        $sku = trim((string) (
            $row['sku_barcode']
            ?? $row['sku']
            ?? $row['barcode']
            ?? $row['kode_produk']
            ?? $row['kode_barang']
            ?? ''
        ));

        if ($sku === '') {
            $sku = 'BRG-' . strtoupper(substr(uniqid(), -6));
        }

        // Extract and resolve Category
        $rawCategory = trim((string) (
            $row['kategori']
            ?? $row['category']
            ?? $row['nama_kategori']
            ?? $row['kategori_id_opsional']
            ?? $row['kategori_id']
            ?? ''
        ));

        $categoryId = null;
        if ($rawCategory !== '') {
            if (is_numeric($rawCategory)) {
                $categoryId = (int) $rawCategory;
            } else {
                $cacheKey = strtolower($rawCategory);
                if (isset($this->categoryCache[$cacheKey])) {
                    $categoryId = $this->categoryCache[$cacheKey];
                } else {
                    $category = RetailCategory::where('tenant_id', $this->tenantId)
                        ->where('name', $rawCategory)
                        ->first();

                    if (!$category) {
                        $category = RetailCategory::create([
                            'tenant_id' => $this->tenantId,
                            'name' => $rawCategory,
                        ]);
                    }

                    $categoryId = $category->id;
                    $this->categoryCache[$cacheKey] = $categoryId;
                }
            }
        }

        // Extract and resolve Unit
        $rawUnit = trim((string) (
            $row['satuan_dasar']
            ?? $row['satuan']
            ?? $row['unit']
            ?? 'Pcs'
        ));

        if ($rawUnit === '') {
            $rawUnit = 'Pcs';
        }

        $unitKey = strtolower($rawUnit);
        if (!isset($this->unitCache[$unitKey])) {
            $unitModel = RetailUnit::where('tenant_id', $this->tenantId)
                ->where('name', $rawUnit)
                ->first();

            if (!$unitModel) {
                RetailUnit::create([
                    'tenant_id' => $this->tenantId,
                    'name' => $rawUnit,
                ]);
            }
            $this->unitCache[$unitKey] = true;
        }

        // Numeric fields parsing
        $parseNumber = function ($value, $default = 0) {
            if ($value === null || $value === '') return $default;
            // Handle ID currency formatting like 15.000 or Rp 15.000
            $clean = preg_replace('/[^0-9.,-]/', '', (string)$value);
            // If contains comma as decimal separator, replace
            if (str_contains($clean, ',') && !str_contains($clean, '.')) {
                $clean = str_replace(',', '.', $clean);
            } else {
                $clean = str_replace(',', '', $clean);
            }
            return is_numeric($clean) ? (float) $clean : $default;
        };

        $priceBuy = $parseNumber(
            $row['harga_beli_modal']
            ?? $row['harga_beli']
            ?? $row['harga_modal']
            ?? $row['price_buy']
            ?? $row['hpp']
            ?? 0
        );

        $priceSell = $parseNumber(
            $row['harga_jual']
            ?? $row['price_sell']
            ?? $row['harga']
            ?? 0
        );

        $stock = $parseNumber(
            $row['stok_awal']
            ?? $row['stok']
            ?? $row['stock']
            ?? $row['qty']
            ?? 0
        );

        $stockMin = $parseNumber(
            $row['stok_minimum']
            ?? $row['stok_min']
            ?? $row['stock_min']
            ?? $row['min_stock']
            ?? 5,
            5
        );

        // Find existing product for this tenant
        $product = RetailProduct::where('tenant_id', $this->tenantId)
            ->where('sku', $sku)
            ->first();

        if ($product) {
            $product->name = $name;
            $product->unit = $rawUnit;
            $product->stock = $stock;
            $product->stock_min = $stockMin;
            $product->price_buy = $priceBuy;
            $product->price_sell = $priceSell;
            if ($categoryId) {
                $product->category_id = $categoryId;
            }
            $product->save();
            $this->updatedCount++;
            return null; // Already updated in database
        }

        $this->createdCount++;

        return new RetailProduct([
            'tenant_id' => $this->tenantId,
            'sku' => $sku,
            'name' => $name,
            'unit' => $rawUnit,
            'stock' => $stock,
            'stock_min' => $stockMin,
            'price_buy' => $priceBuy,
            'price_sell' => $priceSell,
            'category_id' => $categoryId,
            'is_consignment' => false,
        ]);
    }

    public function getCreatedCount(): int
    {
        return $this->createdCount;
    }

    public function getUpdatedCount(): int
    {
        return $this->updatedCount;
    }
}
