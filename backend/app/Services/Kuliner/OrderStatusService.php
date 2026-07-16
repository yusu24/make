<?php

namespace App\Services\Kuliner;

use App\Models\KulinerOrderStatusLog;
use App\Models\Order;

class OrderStatusService
{
    private const TERMINAL = ['completed', 'cancelled'];

    /**
     * Change an order's status and record it in the audit log
     * (kuliner_order_status_logs). Permissive by design — it does not enforce a
     * strict linear state machine, so it never rejects a transition the existing
     * pending/processing/completed/cancelled flow already relies on. The one rule
     * it does enforce: once an order reaches a terminal state, it cannot silently
     * be moved to a different status.
     */
    public function transition(Order $order, string $toStatus, ?string $note = null): Order
    {
        $fromStatus = $order->status;

        if (in_array($fromStatus, self::TERMINAL, true) && $fromStatus !== $toStatus) {
            throw new \RuntimeException("Pesanan sudah berstatus '{$fromStatus}', tidak bisa diubah lagi.");
        }

        $order->update(['status' => $toStatus]);

        KulinerOrderStatusLog::create([
            'order_id' => $order->id,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'user_id' => auth()->id(),
            'note' => $note,
            'created_at' => now(),
        ]);

        return $order->fresh();
    }
}
