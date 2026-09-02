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
use App\Models\JasaWorkOrder;
use App\Models\JasaServiceCatalog;
use App\Models\JasaSparepart;
use App\Models\JasaTechnician;
use App\Models\JasaContract;
use App\Models\JasaFinanceTransaction;
use App\Models\JasaSetting;
use App\Models\Tenant;

class JasaStoreBackupExport implements WithMultipleSheets
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function sheets(): array
    {
        return [
            new JasaBackupWorkOrdersSheet($this->tenantId),
            new JasaBackupServicesSheet($this->tenantId),
            new JasaBackupSparepartsSheet($this->tenantId),
            new JasaBackupTechniciansSheet($this->tenantId),
            new JasaBackupContractsSheet($this->tenantId),
            new JasaBackupFinanceSheet($this->tenantId),
            new JasaBackupStoreInfoSheet($this->tenantId),
        ];
    }
}

// ─── Sheet 1: Surat Perintah Kerja (SPK) ─────────────────────────────────────
class JasaBackupWorkOrdersSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Surat Perintah Kerja (SPK)';
    }

    public function collection()
    {
        return JasaWorkOrder::where('tenant_id', $this->tenantId)
            ->with('technician')
            ->latest('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No. SPK',
            'Judul Pekerjaan',
            'Nama Pelanggan / Klien',
            'Perusahaan',
            'No. Telepon / WA',
            'Perangkat / Unit',
            'Kategori Layanan',
            'Prioritas',
            'Teknisi Penanggung Jawab',
            'Tanggal Jadwal',
            'Biaya Jasa (Rp)',
            'Biaya Sparepart (Rp)',
            'Total Biaya (Rp)',
            'Status SPK',
            'Status Pembayaran',
        ];
    }

    public function map($w): array
    {
        return [
            $w->spk_number ?? ('SPK-' . $w->id),
            $w->title ?? 'Pekerjaan Jasa',
            $w->customer_name ?? 'Pelanggan',
            $w->customer_company ?? '-',
            $w->customer_phone ?? '-',
            $w->equipment_name ?? '-',
            $w->category ?? '-',
            match ($w->priority) {
                'darurat' => 'Darurat 🔴',
                'tinggi'  => 'Tinggi 🟠',
                'normal'  => 'Normal 🟢',
                default   => $w->priority ?? 'Normal',
            },
            $w->technician?->name ?? 'Belum Ditugaskan',
            $w->scheduled_date ? Carbon::parse($w->scheduled_date)->translatedFormat('d M Y') : '-',
            (float)($w->total_labor_cost ?? 0),
            (float)($w->total_parts_cost ?? 0),
            (float)($w->grand_total ?? 0),
            match ($w->status) {
                'selesai'   => 'Selesai',
                'proses'    => 'Sedang Dikerjakan',
                'menunggu'  => 'Menunggu',
                'dibatalkan'=> 'Dibatalkan',
                default     => $w->status ?? 'Menunggu',
            },
            match ($w->payment_status) {
                'lunas' => 'Lunas',
                'belum' => 'Belum Lunas',
                default => $w->payment_status ?? 'Belum Lunas',
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
                    'startColor' => ['argb' => 'FF2563EB'],
                ],
            ],
        ];
    }
}

// ─── Sheet 2: Katalog Layanan & Tarif Jasa ───────────────────────────────────
class JasaBackupServicesSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Katalog Layanan & Tarif';
    }

    public function collection()
    {
        return JasaServiceCatalog::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'Kode Jasa',
            'Nama Layanan',
            'Kategori',
            'Tarif Dasar (Rp)',
            'Estimasi Durasi (Jam)',
            'Masa Garansi (Hari)',
            'Tingkat Keahlian',
            'Deskripsi Layanan',
        ];
    }

    public function map($s): array
    {
        return [
            $s->code ?? ('SRV-' . $s->id),
            $s->name,
            $s->category ?? 'Umum',
            (float)($s->base_price ?? 0),
            (float)($s->estimated_duration_hours ?? 0),
            (int)($s->warranty_days ?? 0),
            $s->required_skill_level ?? 'Standar',
            $s->description ?? '-',
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

// ─── Sheet 3: Suku Cadang & Material (Sparepart) ─────────────────────────────
class JasaBackupSparepartsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Stok Suku Cadang';
    }

    public function collection()
    {
        return JasaSparepart::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'Kode Item',
            'Nama Suku Cadang / Material',
            'Kategori',
            'Harga (Rp)',
            'Sisa Stok',
            'Satuan',
            'Batas Stok Minimum',
            'Status Stok',
        ];
    }

    public function map($sp): array
    {
        $isLow = (int)($sp->stock ?? 0) <= (int)($sp->min_stock_alert ?? 0);
        return [
            $sp->item_code ?? ('PART-' . $sp->id),
            $sp->name,
            $sp->category ?? '-',
            (float)($sp->price ?? 0),
            (int)($sp->stock ?? 0),
            $sp->unit ?? 'pcs',
            (int)($sp->min_stock_alert ?? 0),
            $isLow ? 'Stok Menipis ⚠️' : 'Stok Aman',
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

// ─── Sheet 4: Tim & Pekerja Lapangan (Teknisi) ───────────────────────────────
class JasaBackupTechniciansSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Tim Teknisi & Pekerja';
    }

    public function collection()
    {
        return JasaTechnician::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Pekerja / Teknisi',
            'Spesialisasi / Keahlian',
            'No. Telepon / WA',
            'Email',
            'Rating',
            'Pekerjaan Selesai',
            'Status Saat Ini',
            'Status Akun',
        ];
    }

    public function map($t): array
    {
        return [
            $t->id,
            $t->name,
            $t->specialty ?? '-',
            $t->phone ?? '-',
            $t->email ?? '-',
            (float)($t->rating ?? 5.0),
            (int)($t->completed_jobs ?? 0),
            match ($t->current_status) {
                'available' => 'Siaga (Tersedia)',
                'on_duty'   => 'Sedang Bertugas',
                'off'       => 'Libur',
                default     => $t->current_status ?? 'Tersedia',
            },
            $t->is_active ? 'Aktif' : 'Nonaktif',
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

// ─── Sheet 5: Kontrak Kerja & Reservasi Berkala ──────────────────────────────
class JasaBackupContractsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Kontrak Kerja & SLA';
    }

    public function collection()
    {
        return JasaContract::where('tenant_id', $this->tenantId)
            ->with('technician')
            ->latest('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No. Kontrak',
            'Judul Kontrak / Layanan',
            'Klien / Perusahaan',
            'PIC Klien',
            'No. Telepon',
            'Kategori Layanan',
            'Nilai Kontrak (Rp)',
            'Frekuensi Kunjungan',
            'Total Kuota Kunjungan',
            'Kunjungan Selesai',
            'Tanggal Mulai',
            'Tanggal Berakhir',
            'Status Kontrak',
        ];
    }

    public function map($c): array
    {
        return [
            $c->contract_number ?? ('CTR-' . $c->id),
            $c->title ?? 'Kontrak Layanan',
            $c->client_company ?? $c->client_name ?? '-',
            $c->client_name ?? '-',
            $c->client_phone ?? '-',
            $c->service_category ?? '-',
            (float)($c->contract_value ?? 0),
            $c->frequency ?? 'Bulanan',
            (int)($c->total_visits_quota ?? 0),
            (int)($c->completed_visits_count ?? 0),
            $c->start_date ? Carbon::parse($c->start_date)->translatedFormat('d M Y') : '-',
            $c->end_date ? Carbon::parse($c->end_date)->translatedFormat('d M Y') : '-',
            match ($c->status) {
                'aktif'     => 'Aktif',
                'selesai'   => 'Selesai',
                'tertunda'  => 'Tertunda',
                default     => $c->status ?? 'Aktif',
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
class JasaBackupFinanceSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Keuangan & Transaksi';
    }

    public function collection()
    {
        return JasaFinanceTransaction::where('tenant_id', $this->tenantId)
            ->latest('transaction_date')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No. Transaksi',
            'Tanggal',
            'Jenis (Pemasukan/Pengeluaran)',
            'Kategori',
            'Penerima / Pembayar',
            'Jumlah (Rp)',
            'Metode Pembayaran',
            'Catatan / Referensi',
        ];
    }

    public function map($f): array
    {
        return [
            $f->transaction_number ?? ('TRX-' . $f->id),
            $f->transaction_date ? Carbon::parse($f->transaction_date)->translatedFormat('d M Y') : '-',
            match ($f->type) {
                'income'  => 'Pemasukan',
                'expense' => 'Pengeluaran',
                default   => $f->type ?? '-',
            },
            $f->category ?? '-',
            $f->recipient_or_payer ?? '-',
            (float)($f->amount ?? 0),
            $f->payment_method ?? 'Transfer',
            $f->notes ?? $f->reference_number ?? '-',
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

// ─── Sheet 7: Profil & Konfigurasi Jasa ──────────────────────────────────────
class JasaBackupStoreInfoSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function title(): string
    {
        return 'Profil & Pengaturan Jasa';
    }

    public function collection()
    {
        $setting = JasaSetting::where('tenant_id', $this->tenantId)->first();
        $tenant  = Tenant::where('tenant_id', $this->tenantId)->first();

        $rows = [
            (object)['label' => 'ID Tenant',               'value' => $this->tenantId],
            (object)['label' => 'Nama Usaha Jasa',          'value' => $tenant?->name ?? 'Jasa Servis'],
            (object)['label' => 'Tipe Bisnis Jasa',         'value' => $setting?->business_type ?? 'Servis & Jasa Umum'],
            (object)['label' => 'Istilah Teknisi',          'value' => $setting?->term_technician ?? 'Teknisi'],
            (object)['label' => 'Istilah Sparepart',        'value' => $setting?->term_sparepart ?? 'Suku Cadang'],
            (object)['label' => 'Istilah SPK',              'value' => $setting?->term_spk ?? 'SPK'],
            (object)['label' => 'Prefix Dokumen SPK',       'value' => $setting?->document_prefix ?? 'SPK-'],
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
