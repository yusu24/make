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
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaHarvest;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHealth;
use App\Models\BudidayaInventory;
use App\Models\BudidayaExpense;
use App\Models\BudidayaSetting;
use App\Models\Tenant;

class BudidayaStoreBackupExport implements WithMultipleSheets
{
    protected $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function sheets(): array
    {
        return [
            new BudidayaBackupPondsSheet($this->tenantId),
            new BudidayaBackupCyclesSheet($this->tenantId),
            new BudidayaBackupHarvestsSheet($this->tenantId),
            new BudidayaBackupFeedingsSheet($this->tenantId),
            new BudidayaBackupHealthSheet($this->tenantId),
            new BudidayaBackupInventorySheet($this->tenantId),
            new BudidayaBackupExpensesSheet($this->tenantId),
            new BudidayaBackupStoreInfoSheet($this->tenantId),
        ];
    }
}

// ─── Sheet 1: Kolam / Tambak ──────────────────────────────────────────────────
class BudidayaBackupPondsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Kolam & Tambak'; }

    public function collection()
    {
        return BudidayaPond::where('tenant_id', $this->tenantId)->latest('id')->get();
    }

    public function headings(): array
    {
        return ['ID Kolam', 'Nama Kolam', 'Tipe', 'Kapasitas (ekor)', 'Volume (m³)', 'Status', 'Lokasi', 'Dibuat'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->name ?? '-',
            $row->type ?? '-',
            $row->capacity ?? '-',
            $row->volume ?? '-',
            $row->status ?? '-',
            $row->location ?? '-',
            $row->created_at ? Carbon::parse($row->created_at)->format('d/m/Y') : '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF0EA5E9']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 2: Siklus Budidaya ─────────────────────────────────────────────────
class BudidayaBackupCyclesSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Siklus Budidaya'; }

    public function collection()
    {
        return BudidayaCycle::where('tenant_id', $this->tenantId)->latest('id')->get();
    }

    public function headings(): array
    {
        return ['ID Siklus', 'Kolam', 'Spesies', 'Jumlah Tebar (ekor)', 'Berat Awal (kg)', 'Tgl Mulai', 'Tgl Selesai', 'Status', 'Catatan'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->pond_id ?? '-',
            $row->species ?? '-',
            $row->initial_count ?? '-',
            $row->initial_weight ?? '-',
            $row->start_date ? Carbon::parse($row->start_date)->format('d/m/Y') : '-',
            $row->end_date   ? Carbon::parse($row->end_date)->format('d/m/Y')   : '-',
            $row->status ?? '-',
            $row->notes  ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF10B981']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 3: Data Panen ──────────────────────────────────────────────────────
class BudidayaBackupHarvestsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Data Panen'; }

    public function collection()
    {
        return BudidayaHarvest::where('tenant_id', $this->tenantId)->latest('id')->get();
    }

    public function headings(): array
    {
        return ['ID Panen', 'ID Siklus', 'Tanggal Panen', 'Jumlah Panen (ekor)', 'Berat Total (kg)', 'Harga/kg (Rp)', 'Total Nilai (Rp)', 'Tipe Panen', 'Catatan'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->cycle_id  ?? '-',
            $row->harvest_date ? Carbon::parse($row->harvest_date)->format('d/m/Y') : '-',
            $row->quantity   ?? '-',
            $row->weight_kg  ?? '-',
            $row->price_per_kg    ? number_format($row->price_per_kg, 0, ',', '.') : '-',
            $row->total_revenue   ? number_format($row->total_revenue, 0, ',', '.') : '-',
            $row->harvest_type ?? '-',
            $row->notes        ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FFF59E0B']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 4: Jadwal Pakan ────────────────────────────────────────────────────
class BudidayaBackupFeedingsSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Jadwal & Log Pakan'; }

    public function collection()
    {
        return BudidayaFeeding::where('tenant_id', $this->tenantId)->latest('id')->get();
    }

    public function headings(): array
    {
        return ['ID', 'ID Siklus', 'Waktu Pemberian', 'Jenis Pakan', 'Jumlah (kg)', 'FCR', 'Petugas', 'Catatan'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->cycle_id   ?? '-',
            $row->fed_at     ? Carbon::parse($row->fed_at)->format('d/m/Y H:i') : '-',
            $row->feed_type  ?? '-',
            $row->amount_kg  ?? '-',
            $row->fcr        ?? '-',
            $row->fed_by     ?? '-',
            $row->notes      ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF8B5CF6']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 5: Log Kesehatan ───────────────────────────────────────────────────
class BudidayaBackupHealthSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Log Kesehatan'; }

    public function collection()
    {
        return BudidayaHealth::where('tenant_id', $this->tenantId)->latest('id')->get();
    }

    public function headings(): array
    {
        return ['ID', 'ID Siklus', 'Tanggal', 'Kondisi', 'Mortalitas (ekor)', 'Penyakit / Gejala', 'Tindakan', 'Catatan'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->cycle_id   ?? '-',
            $row->logged_at  ? Carbon::parse($row->logged_at)->format('d/m/Y') : '-',
            $row->condition  ?? '-',
            $row->mortality  ?? 0,
            $row->disease    ?? '-',
            $row->treatment  ?? '-',
            $row->notes      ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FFEF4444']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 6: Inventaris & Pakan ──────────────────────────────────────────────
class BudidayaBackupInventorySheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Inventaris & Pakan'; }

    public function collection()
    {
        return BudidayaInventory::where('tenant_id', $this->tenantId)->get();
    }

    public function headings(): array
    {
        return ['ID', 'Nama Barang', 'Kategori', 'Satuan', 'Stok', 'Harga Satuan (Rp)', 'Nilai Stok (Rp)', 'Min. Stok', 'Dibuat'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->name      ?? '-',
            $row->category  ?? '-',
            $row->unit      ?? '-',
            $row->stock     ?? 0,
            $row->unit_price ? number_format($row->unit_price, 0, ',', '.') : '-',
            ($row->stock && $row->unit_price) ? number_format($row->stock * $row->unit_price, 0, ',', '.') : '-',
            $row->min_stock ?? 0,
            $row->created_at ? Carbon::parse($row->created_at)->format('d/m/Y') : '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF0891B2']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 7: Keuangan & Pengeluaran ─────────────────────────────────────────
class BudidayaBackupExpensesSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Keuangan & Pengeluaran'; }

    public function collection()
    {
        return BudidayaExpense::where('tenant_id', $this->tenantId)->latest('id')->get();
    }

    public function headings(): array
    {
        return ['ID', 'ID Siklus', 'Tanggal', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Dicatat Oleh', 'Catatan'];
    }

    public function map($row): array
    {
        return [
            $row->id,
            $row->cycle_id    ?? '-',
            $row->expense_date ? Carbon::parse($row->expense_date)->format('d/m/Y') : '-',
            $row->category    ?? '-',
            $row->description ?? '-',
            $row->amount      ? number_format($row->amount, 0, ',', '.') : '-',
            $row->recorded_by ?? '-',
            $row->notes       ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF16A34A']],
            'alignment' => ['horizontal' => 'center'],
        ]);
    }
}

// ─── Sheet 8: Profil & Pengaturan Farm ───────────────────────────────────────
class BudidayaBackupStoreInfoSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $tenantId;
    public function __construct($tenantId) { $this->tenantId = $tenantId; }
    public function title(): string { return 'Profil & Pengaturan Farm'; }

    public function collection()
    {
        $setting = BudidayaSetting::where('tenant_id', $this->tenantId)->first();
        $tenant  = Tenant::find($this->tenantId);
        return collect([
            [
                'key'   => 'Tanggal Backup',
                'value' => Carbon::now()->translatedFormat('d F Y H:i') . ' WIB',
            ],
            ['key' => 'Tenant ID',     'value' => $this->tenantId],
            ['key' => 'Nama Bisnis',   'value' => $tenant?->name ?? '-'],
            ['key' => 'Email',         'value' => $tenant?->email ?? '-'],
            ['key' => 'Nama Farm',     'value' => $setting?->farm_name ?? '-'],
            ['key' => 'Jenis Budidaya','value' => $setting?->farming_category ?? '-'],
            ['key' => 'Tipe Farm',     'value' => $setting?->farm_type ?? '-'],
            ['key' => 'Mode Tracking', 'value' => $setting?->tracking_mode ?? '-'],
        ]);
    }

    public function headings(): array { return ['Informasi', 'Detail']; }

    public function map($row): array
    {
        return [$row['key'], $row['value']];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF475569']],
            'alignment' => ['horizontal' => 'center'],
        ]);
        $sheet->getStyle('A2:A100')->applyFromArray([
            'font' => ['bold' => true],
        ]);
    }
}
