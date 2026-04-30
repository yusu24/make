<?php

namespace App\Services\Budidaya;

use App\Models\BudidayaPond;
use Illuminate\Support\Facades\DB;
use Exception;

class PondService
{
    /**
     * Create a new pond with auto-generated code if not provided.
     */
    public function createPond(array $data)
    {
        $code = $data['code'] ?? null;
        
        if (!$code) {
            $count = BudidayaPond::count() + 1;
            $code = 'KL-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            
            // Ensure generated code is unique
            while (BudidayaPond::where('code', $code)->exists()) {
                $count++;
                $code = 'KL-' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }
        }

        $data['code'] = $code;
        $data['status'] = 'kosong';

        return BudidayaPond::create($data);
    }

    /**
     * Update an existing pond.
     * Prevents manual override of status unless it is 'maintenance'.
     */
    public function updatePond(BudidayaPond $pond, array $data)
    {
        if (isset($data['status'])) {
            // Only allow manual change to maintenance or from maintenance back to kosong
            if ($data['status'] === 'maintenance') {
                if ($pond->status === 'aktif' || $pond->status === 'panen') {
                    throw new Exception("Kolam sedang aktif atau dalam proses panen. Tidak bisa diubah ke maintenance.");
                }
            } elseif ($data['status'] === 'kosong' && $pond->status === 'maintenance') {
                // Allowed
            } else {
                // Ignore the status update if it's not a valid manual transition
                // System events (start cycle, finish cycle) will use updateStatus directly
                unset($data['status']);
            }
        }

        $pond->update($data);
        return $pond;
    }

    /**
     * System method to update status based on lifecycle events.
     */
    public function updateStatus(BudidayaPond $pond, string $status)
    {
        $validStatuses = ['kosong', 'aktif', 'panen', 'maintenance'];
        
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Status kolam tidak valid.");
        }

        $pond->update(['status' => $status]);
        return $pond;
    }

    /**
     * Delete a pond if it has no history.
     */
    public function deletePond(BudidayaPond $pond)
    {
        $historyCount = $pond->cycles()->count();
        
        if ($historyCount > 0) {
            throw new Exception('Kolam tidak bisa dihapus karena memiliki riwayat siklus (panen/aktif). Silakan gunakan status Maintenance jika tidak ingin digunakan.');
        }

        $pond->delete();
    }
}
