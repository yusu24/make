<?php

namespace App\Imports;

use App\Models\RetailUnit;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RetailUnitsImport implements ToModel, WithHeadingRow
{
    protected string $tenantId;
    protected int $createdCount = 0;
    protected int $skippedCount = 0;

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function model(array $row)
    {
        $name = trim((string) (
            $row['nama_satuan']
            ?? $row['nama']
            ?? $row['name']
            ?? $row['satuan']
            ?? $row['unit']
            ?? ''
        ));

        if ($name === '') {
            return null;
        }

        $existing = RetailUnit::where('tenant_id', $this->tenantId)
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->first();

        if ($existing) {
            $this->skippedCount++;
            return null;
        }

        $this->createdCount++;

        return new RetailUnit([
            'tenant_id' => $this->tenantId,
            'name' => $name,
        ]);
    }

    public function getCreatedCount(): int
    {
        return $this->createdCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }
}
