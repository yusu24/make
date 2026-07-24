<?php

namespace App\Services\Kuliner;

use App\Models\KulinerShift;
use App\Models\Order;

class ShiftService
{
    public function openShift(string $tenantId, int $userId, float $openingCash, ?string $note = null): KulinerShift
    {
        if (KulinerShift::where('tenant_id', $tenantId)->where('status', 'open')->exists()) {
            throw new \RuntimeException('Sudah ada shift yang masih terbuka. Tutup shift tersebut terlebih dahulu.');
        }

        return KulinerShift::create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'opening_cash' => $openingCash,
            'status' => 'open',
            'note' => $note,
            'opened_at' => now(),
        ]);
    }

    public function closeShift(KulinerShift $shift, float $closingCash, ?string $note = null): KulinerShift
    {
        if ($shift->status !== 'open') {
            throw new \RuntimeException('Shift ini sudah ditutup sebelumnya.');
        }

        $closedAt = now();
        $cashSales = (float) Order::where('tenant_id', $shift->tenant_id)
            ->where('payment_method', 'cash_cashier')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$shift->opened_at, $closedAt])
            ->sum('total');

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

    public function currentOpenShift(string $tenantId): ?KulinerShift
    {
        return KulinerShift::where('tenant_id', $tenantId)->where('status', 'open')->first();
    }
}
