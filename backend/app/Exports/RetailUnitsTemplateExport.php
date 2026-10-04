<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RetailUnitsTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'Nama Satuan',
        ];
    }

    public function array(): array
    {
        return [
            ['Pcs'],
            ['Botol'],
            ['Bungkus'],
            ['Dus / Box'],
            ['Pack'],
            ['Kg'],
            ['Gram'],
            ['Liter'],
            ['Lusin'],
            ['Renceng'],
            ['Karton'],
            ['Sachet'],
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
                    'startColor' => ['rgb' => 'D97706'], // Amber header
                ],
            ],
        ];
    }
}
