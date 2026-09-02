<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;
use App\Models\RetailProduct;
use App\Models\RetailTransaction;
use App\Models\RetailCustomer;
use App\Models\RetailSupplier;
use App\Models\RetailSetting;
use App\Models\Tenant;

class RetailStoreBackupExport implements WithMultipleSheets
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function sheets(): array
    {
        return [
            new RetailBackupProductsSheet($this->tenantId),
            new RetailBackupTransactionsSheet($this->tenantId),
            new RetailBackupCustomersSheet($this->tenantId),
            new RetailBackupSuppliersSheet($this->tenantId),
            new RetailBackupStoreInfoSheet($this->tenantId),
        ];
    }
}

class RetailBackupProductsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Produk & Stok';
    }

    public function collection()
    {
        return RetailProduct::where('tenant_id', $this->tenantId)
            ->with(['category', 'units'])
            ->get();
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Barcode',
            'Nama Produk',
            'Kategori',
            'Satuan Dasar',
            'Harga Modal (Rp)',
            'Harga Jual (Rp)',
            'Stok Saat Ini',
            'Stok Minimum',
            'Status Aktif',
        ];
    }

    public function map($p): array
    {
        return [
            $p->sku ?? '-',
            $p->barcode ?? '-',
            $p->name,
            $p->category?->name ?? 'Tanpa Kategori',
            $p->unit ?? 'pcs',
            (float)($p->cost_price ?? $p->price_buy ?? 0),
            (float)($p->price ?? $p->price_sell ?? 0),
            (float)($p->stock ?? 0),
            (float)($p->min_stock ?? $p->stock_min ?? 0),
            $p->is_active ? 'Aktif' : 'Nonaktif',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF2563EB'],
                ],
            ],
        ];
    }
}

class RetailBackupTransactionsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Riwayat Transaksi';
    }

    public function collection()
    {
        return RetailTransaction::where('tenant_id', $this->tenantId)
            ->with(['customer', 'items', 'payments'])
            ->latest('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No. Faktur',
            'Tanggal & Waktu',
            'Kasir',
            'Pelanggan',
            'Subtotal (Rp)',
            'Diskon (Rp)',
            'Pajak (Rp)',
            'Total Akhir (Rp)',
            'Metode Pembayaran',
            'Status',
        ];
    }

    public function map($t): array
    {
        $methods = $t->payments ? $t->payments->pluck('payment_method')->unique()->implode(', ') : ($t->payment_method ?? 'Tunai');
        return [
            $t->invoice_no ?? ('#INV-' . $t->id),
            $t->created_at ? Carbon::parse($t->created_at)->translatedFormat('d M Y H:i') : '-',
            $t->cashier_name ?? 'Kasir',
            $t->customer?->name ?? ($t->customer_name ?? 'Umum'),
            (float)($t->subtotal ?? 0),
            (float)($t->discount ?? 0),
            (float)($t->tax ?? 0),
            (float)($t->total_amount ?? $t->grand_total ?? 0),
            $methods ?: 'Tunai',
            $t->status === 'paid' ? 'Lunas' : ($t->status ?? 'Lunas'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF10B981'],
                ],
            ],
        ];
    }
}

class RetailBackupCustomersSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Data Pelanggan';
    }

    public function collection()
    {
        return RetailCustomer::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'ID / Kode',
            'Nama Pelanggan',
            'No. HP / WhatsApp',
            'Email',
            'Alamat',
            'Total Poin',
        ];
    }

    public function map($c): array
    {
        return [
            $c->code ?? ('CUST-' . $c->id),
            $c->name,
            $c->phone ?? '-',
            $c->email ?? '-',
            $c->address ?? '-',
            (int)($c->loyalty_points ?? $c->points ?? 0),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF8B5CF6'],
                ],
            ],
        ];
    }
}

class RetailBackupSuppliersSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Data Supplier';
    }

    public function collection()
    {
        return RetailSupplier::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'ID / Kode',
            'Nama Pemasok / Distributor',
            'PIC / Kontak',
            'No. Telepon',
            'Email',
            'Alamat',
        ];
    }

    public function map($s): array
    {
        return [
            $s->code ?? ('SUP-' . $s->id),
            $s->name,
            $s->contact_person ?? $s->pic ?? '-',
            $s->phone ?? '-',
            $s->email ?? '-',
            $s->address ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFF59E0B'],
                ],
            ],
        ];
    }
}

class RetailBackupStoreInfoSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Informasi Toko';
    }

    public function collection()
    {
        $setting = RetailSetting::where('tenant_id', $this->tenantId)->first();
        $tenant = Tenant::where('tenant_id', $this->tenantId)->first();

        $rows = [
            (object)['label' => 'ID Tenant', 'value' => $this->tenantId],
            (object)['label' => 'Nama Toko', 'value' => $setting->store_name ?? $tenant?->name ?? 'Toko Retail'],
            (object)['label' => 'No. Telepon / HP', 'value' => $setting->store_phone ?? '-'],
            (object)['label' => 'Alamat Toko', 'value' => $setting->store_address ?? '-'],
            (object)['label' => 'Waktu Generate Backup', 'value' => Carbon::now()->translatedFormat('d F Y H:i:s') . ' WIB'],
            (object)['label' => 'Platform', 'value' => 'Bizora SaaS Cloud Platform'],
        ];

        return collect($rows);
    }

    public function headings(): array
    {
        return [
            'Informasi',
            'Detail',
        ];
    }

    public function map($row): array
    {
        return [
            $row->label,
            $row->value,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF334155'],
                ],
            ],
        ];
    }
}
