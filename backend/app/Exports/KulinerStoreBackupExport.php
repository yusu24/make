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
use App\Models\KulinerProduct;
use App\Models\Order;
use App\Models\KulinerIngredient;
use App\Models\KulinerSupplier;
use App\Models\KulinerTable;
use App\Models\KulinerSetting;
use App\Models\KulinerExpense;
use App\Models\KulinerShift;
use App\Models\Tenant;

class KulinerStoreBackupExport implements WithMultipleSheets
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function sheets(): array
    {
        return [
            new KulinerBackupMenuSheet($this->tenantId),
            new KulinerBackupOrdersSheet($this->tenantId),
            new KulinerBackupIngredientsSheet($this->tenantId),
            new KulinerBackupSuppliersSheet($this->tenantId),
            new KulinerBackupTablesSheet($this->tenantId),
            new KulinerBackupExpensesSheet($this->tenantId),
            new KulinerBackupShiftsSheet($this->tenantId),
            new KulinerBackupStoreInfoSheet($this->tenantId),
        ];
    }
}

// ─── Sheet 1: Menu Makanan & Minuman ─────────────────────────────────────────
class KulinerBackupMenuSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Menu Makanan & Minuman';
    }

    public function collection()
    {
        return KulinerProduct::where('tenant_id', $this->tenantId)
            ->with('category')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Menu',
            'Kategori',
            'Harga Jual (Rp)',
            'Harga Diskon (Rp)',
            'Stok',
            'Status Ketersediaan',
        ];
    }

    public function map($p): array
    {
        return [
            $p->id,
            $p->name,
            $p->category?->name ?? 'Tanpa Kategori',
            (float)($p->price ?? 0),
            (float)($p->discount_price ?? 0),
            (int)($p->stock ?? 0),
            $p->is_available ? 'Tersedia' : 'Tidak Tersedia',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFEF4444'],
                ],
            ],
        ];
    }
}

// ─── Sheet 2: Riwayat Pesanan & Transaksi ────────────────────────────────────
class KulinerBackupOrdersSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Riwayat Pesanan';
    }

    public function collection()
    {
        return Order::where('tenant_id', $this->tenantId)
            ->latest('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No. Order',
            'Tanggal & Waktu',
            'Nama Pelanggan',
            'Jenis Pesanan',
            'No. Meja',
            'Subtotal (Rp)',
            'Pajak (Rp)',
            'Service Charge (Rp)',
            'Total (Rp)',
            'Metode Bayar',
            'Status',
        ];
    }

    public function map($o): array
    {
        return [
            $o->order_number ?? ('#ORD-' . $o->id),
            $o->created_at ? Carbon::parse($o->created_at)->translatedFormat('d M Y H:i') : '-',
            $o->customer_name ?? 'Pelanggan Umum',
            $o->order_type === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang',
            $o->table_number ?? '-',
            (float)($o->subtotal ?? 0),
            (float)($o->tax_amount ?? 0),
            (float)($o->service_charge_amount ?? 0),
            (float)($o->total ?? 0),
            $o->payment_method ?? 'Tunai',
            match ($o->status) {
                'completed' => 'Selesai',
                'pending'   => 'Menunggu',
                'cancelled' => 'Dibatalkan',
                'paid'      => 'Lunas',
                default     => $o->status ?? 'Selesai',
            },
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

// ─── Sheet 3: Stok Bahan Baku & Inventaris Dapur ─────────────────────────────
class KulinerBackupIngredientsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Stok Bahan Baku';
    }

    public function collection()
    {
        return KulinerIngredient::where('tenant_id', $this->tenantId)
            ->with('supplier')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Kode',
            'Nama Bahan Baku',
            'Kategori',
            'Satuan',
            'Sisa Stok',
            'Stok Minimum',
            'Harga Terakhir (Rp)',
            'Supplier',
            'Status Aktif',
            'Status Stok',
        ];
    }

    public function map($i): array
    {
        return [
            $i->code ?? ('ING-' . $i->id),
            $i->name,
            $i->category ?? '-',
            $i->unit ?? '-',
            (float)($i->stock ?? 0),
            (float)($i->min_stock ?? 0),
            (float)($i->last_price ?? 0),
            $i->supplier?->name ?? '-',
            $i->is_active ? 'Aktif' : 'Nonaktif',
            (float)($i->stock ?? 0) <= (float)($i->min_stock ?? 0) ? 'Stok Menipis ⚠️' : 'Stok Aman',
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

// ─── Sheet 4: Data Supplier Bahan Baku ───────────────────────────────────────
class KulinerBackupSuppliersSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
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
        return KulinerSupplier::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Pemasok / Supplier',
            'Kontak / No. Telepon',
            'Alamat',
        ];
    }

    public function map($s): array
    {
        return [
            $s->id,
            $s->name,
            $s->contact ?? '-',
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
                    'startColor' => ['argb' => 'FF8B5CF6'],
                ],
            ],
        ];
    }
}

// ─── Sheet 5: Daftar Meja Restoran ───────────────────────────────────────────
class KulinerBackupTablesSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Daftar Meja';
    }

    public function collection()
    {
        return KulinerTable::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama / No. Meja',
            'Kapasitas (Kursi)',
            'Status',
        ];
    }

    public function map($t): array
    {
        return [
            $t->id,
            $t->name,
            (int)($t->capacity ?? 0),
            match ($t->status) {
                'available' => 'Tersedia',
                'occupied'  => 'Terisi',
                'reserved'  => 'Dipesan',
                default     => $t->status ?? 'Tersedia',
            },
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0EA5E9'],
                ],
            ],
        ];
    }
}

// ─── Sheet 6: Keuangan & Pengeluaran ─────────────────────────────────────────
class KulinerBackupExpensesSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Keuangan & Pengeluaran';
    }

    public function collection()
    {
        return KulinerExpense::where('tenant_id', $this->tenantId)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Tanggal',
            'Kategori',
            'Jenis (Pemasukan/Pengeluaran)',
            'Deskripsi / Keterangan',
            'Jumlah (Rp)',
        ];
    }

    public function map($e): array
    {
        return [
            $e->id,
            $e->date ? Carbon::parse($e->date)->translatedFormat('d M Y') : '-',
            $e->category ?? '-',
            match ($e->type) {
                'income'  => 'Pemasukan',
                'expense' => 'Pengeluaran',
                default   => $e->type ?? '-',
            },
            $e->description ?? '-',
            (float)($e->amount ?? 0),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF16A34A'],
                ],
            ],
        ];
    }
}

// ─── Sheet 7: Riwayat Shift Kasir ────────────────────────────────────────────
class KulinerBackupShiftsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Riwayat Shift Kasir';
    }

    public function collection()
    {
        return KulinerShift::where('tenant_id', $this->tenantId)
            ->with('user')
            ->latest('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Kasir',
            'Waktu Buka Shift',
            'Waktu Tutup Shift',
            'Modal Awal (Rp)',
            'Uang Penutup (Rp)',
            'Ekspektasi Kas (Rp)',
            'Selisih (Rp)',
            'Status',
            'Catatan',
        ];
    }

    public function map($s): array
    {
        return [
            $s->id,
            $s->user?->name ?? 'Kasir',
            $s->opened_at ? Carbon::parse($s->opened_at)->translatedFormat('d M Y H:i') : '-',
            $s->closed_at ? Carbon::parse($s->closed_at)->translatedFormat('d M Y H:i') : 'Belum Ditutup',
            (float)($s->opening_cash ?? 0),
            (float)($s->closing_cash ?? 0),
            (float)($s->expected_cash ?? 0),
            (float)($s->difference ?? 0),
            match ($s->status) {
                'open'   => 'Buka',
                'closed' => 'Tutup',
                default  => $s->status ?? '-',
            },
            $s->note ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF6366F1'],
                ],
            ],
        ];
    }
}

// ─── Sheet 8: Profil & Pengaturan Restoran ───────────────────────────────────
class KulinerBackupStoreInfoSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Profil Restoran';
    }

    public function collection()
    {
        $setting = KulinerSetting::where('tenant_id', $this->tenantId)->first();
        $tenant  = Tenant::where('tenant_id', $this->tenantId)->first();

        $rows = [
            (object)['label' => 'ID Tenant',               'value' => $this->tenantId],
            (object)['label' => 'Nama Restoran',            'value' => $setting?->store_name ?? $tenant?->name ?? 'Restoran'],
            (object)['label' => 'No. Telepon',              'value' => $setting?->phone ?? '-'],
            (object)['label' => 'Alamat',                   'value' => $setting?->address ?? '-'],
            (object)['label' => 'Jam Operasional',          'value' => $setting?->opening_hours ?? '-'],
            (object)['label' => 'Hari Operasional',         'value' => $setting?->operational_days ?? '-'],
            (object)['label' => 'Total Meja',               'value' => $setting?->total_tables ?? '-'],
            (object)['label' => 'Mode Dine-In',             'value' => $setting?->dine_in_enabled ? 'Aktif' : 'Nonaktif'],
            (object)['label' => 'Waktu Generate Backup',    'value' => Carbon::now()->translatedFormat('d F Y H:i:s') . ' WIB'],
            (object)['label' => 'Platform',                 'value' => 'Bizora SaaS Cloud Platform'],
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
