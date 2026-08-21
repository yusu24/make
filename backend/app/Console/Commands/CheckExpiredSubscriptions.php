<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;

class CheckExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-expired-subscriptions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mengecek dan memperbarui status tenant yang masa aktifnya telah habis.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai pengecekan langganan kedaluwarsa...');

        $now = now();

        $expiredTenants = Tenant::where('status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNotNull('expires_at')
                      ->where('expires_at', '<', $now)
                      ->orWhere(function ($q) use ($now) {
                          $q->whereNull('expires_at')
                            ->whereNotNull('trial_ends_at')
                            ->where('trial_ends_at', '<', $now);
                      });
            })->get();

        $count = 0;
        foreach ($expiredTenants as $tenant) {
            // Bypass demo sandboxes
            if (str_starts_with($tenant->tenant_id, 'TN-DS-') || str_starts_with($tenant->tenant_id, 'TN-DK-')) {
                continue;
            }

            $tenant->status = 'expired';
            $tenant->save();
            $count++;

            $this->info("Tenant {$tenant->tenant_id} telah diset ke expired.");
        }

        $this->info("Selesai. Total $count tenant diubah menjadi expired.");
    }
}
