<?php

namespace App\Exports\Kuliner;

use App\Models\KulinerIngredient;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class IngredientsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private string $tenantId)
    {
    }

    public function query()
    {
        return KulinerIngredient::with('supplier')
            ->where('tenant_id', $this->tenantId)
            ->orderBy('name');
    }

    public function headings(): array
    {
        return ['Kode', 'Nama', 'Kategori', 'Supplier', 'Satuan', 'Harga Terakhir', 'Stok Minimum', 'Stok Saat Ini'];
    }

    public function map($ingredient): array
    {
        return [
            $ingredient->code,
            $ingredient->name,
            $ingredient->category,
            $ingredient->supplier?->name,
            $ingredient->unit,
            (float) $ingredient->last_price,
            (float) $ingredient->min_stock,
            (float) $ingredient->stock,
        ];
    }
}
