<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RetailCategoriesTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'Nama Kategori',
        ];
    }

    public function array(): array
    {
        return [
            ['Sembako & Beras'],
            ['Minuman & Air Mineral'],
            ['Makanan Ringan & Snack'],
            ['Bumbu & Penyedap Masakan'],
            ['Perawatan Tubuh & Sabun'],
            ['Kebutuhan Rumah Tangga'],
            ['Rokok & Tembakau'],
            ['Alat Tulis Kantor (ATK)'],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '059669'], // Emerald green header
                ],
            ],
        ];
    }
}
