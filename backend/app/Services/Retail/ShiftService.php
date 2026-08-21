<?php

namespace App\Services\Retail;

use App\Models\RetailShift;
use App\Models\RetailTransaction;

class ShiftService
{
    public function openShift(string $tenantId, int $userId, float $openingCash, ?string $note = null): RetailShift
    {
        if (RetailShift::where('tenant_id', $tenantId)->where('status', 'open')->exists()) {
            throw new \RuntimeException('Sudah ada shift yang masih terbuka. Tutup shift tersebut terlebih dahulu.');
        }

        return RetailShift::create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'opening_cash' => $openingCash,
            'status' => 'open',
            'note' => $note,
            'opened_at' => now(),
        ]);
    }

    public function closeShift(RetailShift $shift, float $closingCash, ?string $note = null): RetailShift
    {
        if ($shift->status !== 'open') {
            throw new \RuntimeException('Shift ini sudah ditutup sebelumnya.');
        }

        $closedAt = now();
        $cashSales = (float) RetailTransaction::where('tenant_id', $shift->tenant_id)
            ->whereIn('payment_method', ['CASH', 'cash'])
            ->where(function ($query) {
                $query->whereNull('status')->orWhere('status', '!=', 'voided');
            })
            ->whereBetween('created_at', [$shift->opened_at, $closedAt])
            ->sum('total_amount');

        $expected = (float) $shift->opening_cash + $cashSales;
        $difference = $closingCash - $expected;

        $shift->update([
            'closing_cash' => $closingCash,
            'expected_cash' => $expected,
            'difference' => $difference,
            'status' => 'closed',
            'closed_at' => $closedAt,
            'note' => $note ?? $shift->note,
        ]);

        return $shift->fresh();
    }

    public function currentOpenShift(string $tenantId): ?RetailShift
    {
        return RetailShift::where('tenant_id', $tenantId)->where('status', 'open')->first();
    }
}
