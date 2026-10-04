<?php

namespace App\Imports;

use App\Models\RetailSupplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RetailSuppliersImport implements ToModel, WithHeadingRow
{
    protected string $tenantId;
    protected int $createdCount = 0;
    protected int $updatedCount = 0;

    public function __construct(string $tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function model(array $row)
    {
        $name = trim((string) (
            $row['nama_supplier']
            ?? $row['nama']
            ?? $row['name']
            ?? $row['supplier']
            ?? ''
        ));

        if ($name === '') {
            return null;
        }

        $contact = trim((string) (
            $row['kontak_telepon_wa']
            ?? $row['kontak']
            ?? $row['telepon']
            ?? $row['phone']
            ?? $row['no_hp']
            ?? ''
        ));

        $address = trim((string) (
            $row['alamat']
            ?? $row['address']
            ?? ''
        ));

        $existing = RetailSupplier::where('tenant_id', $this->tenantId)
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->first();

        if ($existing) {
            $updateData = [];
            if ($contact !== '') $updateData['contact'] = $contact;
            if ($address !== '') $updateData['address'] = $address;

            if (!empty($updateData)) {
                $existing->update($updateData);
            }
            $this->updatedCount++;
            return null;
        }

        $this->createdCount++;

        return new RetailSupplier([
            'tenant_id' => $this->tenantId,
            'name' => $name,
            'contact' => $contact ?: null,
            'address' => $address ?: null,
        ]);
    }

    public function getCreatedCount(): int
    {
        return $this->createdCount;
    }

    public function getUpdatedCount(): int
    {
        return $this->updatedCount;
    }
}
