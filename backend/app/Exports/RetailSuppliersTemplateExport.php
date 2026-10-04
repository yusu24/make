<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RetailSuppliersTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'Nama Supplier',
            'Kontak (Telepon / WA)',
            'Alamat',
        ];
    }

    public function array(): array
    {
        return [
            [
                'PT. Sumber Makmur Abadi',
                '081122334455',
                'Kawasan Industri Pulogadung Blok A5 No. 10, Jakarta Timur',
            ],
            [
                'CV. Berkah Sejahtera Distribusi',
                '081344556677',
                'Jl. Soekarno Hatta No. 88, Semarang',
            ],
            [
                'Distributor Sembako Nusantara',
                '085677889900',
                'Jl. Hayam Wuruk No. 21, Surabaya',
            ],
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
                    'startColor' => ['rgb' => '0D9488'], // Teal header
                ],
            ],
        ];
    }
}
