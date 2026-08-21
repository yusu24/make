<?php

namespace App\Exports;

use App\Models\RetailProduct;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RetailProductsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function collection()
    {
        return RetailProduct::where('user_id', $this->userId)->get();
    }

    public function headings(): array
    {
        return [
            'SKU / Barcode',
            'Nama Produk',
            'Satuan Dasar',
            'Stok Awal',
            'Stok Minimum',
            'Harga Jual',
            'Kategori ID (opsional)',
        ];
    }

    public function map($product): array
    {
        return [
            $product->sku,
            $product->name,
            $product->unit,
            $product->stock,
            $product->stock_min,
            $product->price_sell,
            $product->category_id,
        ];
    }
}
