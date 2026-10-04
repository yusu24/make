<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RetailCustomersTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'Nama Pelanggan',
            'No HP / WhatsApp',
            'Email',
            'Alamat',
            'Poin Loyalitas',
        ];
    }

    public function array(): array
    {
        return [
            [
                'Budi Santoso',
                '081234567890',
                'budi.santoso@gmail.com',
                'Jl. Melati No. 12, RT 02/05, Kebayoran Baru, Jakarta Selatan',
                50,
            ],
            [
                'Siti Nurhaliza',
                '081987654321',
                'siti.nur@yahoo.com',
                'Perumahan Citra Indah Blok B2 No. 8, Bandung',
                100,
            ],
            [
                'Warung Berkah Bu Tejo',
                '085712345678',
                '',
                'Jl. Ahmad Yani No. 45, Surabaya',
                20,
            ],
            [
                'Hendra Gunawan',
                '082155667788',
                'hendra.g@gmail.com',
                'Jl. Diponegoro No. 88, Yogyakarta',
                0,
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
                    'startColor' => ['rgb' => '2563EB'], // Blue header
                ],
            ],
        ];
    }
}
