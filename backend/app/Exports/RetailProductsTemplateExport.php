<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RetailProductsTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
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

    public function array(): array
    {
        return [
            [
                'BRG-001',
                'Minyak Goreng Bimoli 1L',
                'Sembako',
                'Pcs',
                14500,
                17000,
                50,
                10,
            ],
            [
                'BRG-002',
                'Kopi Kapal Api Spesial 65g',
                'Minuman',
                'Bungkus',
                6000,
                7500,
                100,
                15,
            ],
            [
                'BRG-003',
                'Air Mineral Aqua 600ml',
                'Minuman',
                'Botol',
                2800,
                4000,
                48,
                12,
            ],
            [
                'BRG-004',
                'Indomie Goreng Original 85g',
                'Makanan Ringan',
                'Bungkus',
                2700,
                3500,
                80,
                20,
            ],
            [
                'BRG-005',
                'Sabun Lifebuoy Total 10 85g',
                'Perlengkapan Mandi',
                'Pcs',
                4000,
                5500,
                30,
                5,
            ],
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
