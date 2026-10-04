<?php

namespace App\Imports;

use App\Models\RetailCustomer;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RetailCustomersImport implements ToModel, WithHeadingRow
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
            $row['nama_pelanggan']
            ?? $row['nama']
            ?? $row['name']
            ?? $row['pelanggan']
            ?? $row['customer']
            ?? ''
        ));

        if ($name === '') {
            return null;
        }

        $contact = trim((string) (
            $row['no_hp_whatsapp']
            ?? $row['kontak']
            ?? $row['no_hp']
            ?? $row['phone']
            ?? $row['whatsapp']
            ?? ''
        ));

        $email = trim((string) (
            $row['email']
            ?? ''
        ));

        $address = trim((string) (
            $row['alamat']
            ?? $row['address']
            ?? ''
        ));

        $points = (int) (
            $row['poin_loyalitas']
            ?? $row['poin']
            ?? $row['points']
            ?? 0
        );

        // Find existing customer by phone/contact or name
        $query = RetailCustomer::where('tenant_id', $this->tenantId);
        if ($contact !== '') {
            $existing = (clone $query)->where('contact', $contact)->first();
        } else {
            $existing = (clone $query)->whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
        }

        if ($existing) {
            $updateData = [];
            if ($name !== '') $updateData['name'] = $name;
            if ($email !== '') $updateData['email'] = $email;
            if ($address !== '') $updateData['address'] = $address;
            if ($points > 0) $updateData['points'] = $existing->points + $points;

            if (!empty($updateData)) {
                $existing->update($updateData);
            }
            $this->updatedCount++;
            return null;
        }

        $this->createdCount++;

        return new RetailCustomer([
            'tenant_id' => $this->tenantId,
            'name' => $name,
            'contact' => $contact ?: null,
            'email' => $email ?: null,
            'address' => $address ?: null,
            'points' => $points,
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
