<?php

namespace App\Exports;

use App\Models\RetailProduct;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RetailProductsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected string $tenantId;

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function collection()
    {
        return RetailProduct::where('tenant_id', $this->tenantId)
            ->with('category')
            ->orderBy('id', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'SKU / Barcode',
            'Nama Produk',
            'Kategori',
            'Satuan Dasar',
            'Harga Beli (Modal)',
            'Harga Jual',
            'Stok Awal',
            'Stok Minimum',
        ];
    }

    public function map($product): array
    {
        return [
            $product->sku,
            $product->name,
            $product->category?->name ?? '',
            $product->unit ?? 'Pcs',
            $product->price_buy ?? 0,
            $product->price_sell ?? 0,
            $product->stock ?? 0,
            $product->stock_min ?? 0,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => '1E293B']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ];
    }
}
