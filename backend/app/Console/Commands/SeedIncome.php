<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SeedIncome extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:income';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed income categories for retail tenants';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantIds = \Illuminate\Support\Facades\DB::table('retail_finance_categories')->select('tenant_id')->distinct()->pluck('tenant_id');
        
        foreach ($tenantIds as $t) {
            foreach (['Modal Usaha', 'Sewa Lapak', 'Penjualan Aset', 'Lain-lain'] as $ic) {
                $exists = \Illuminate\Support\Facades\DB::table('retail_finance_categories')
                            ->where('tenant_id', $t)
                            ->where('name', $ic)
                            ->where('type', 'income')
                            ->exists();
                if (!$exists) {
                    \Illuminate\Support\Facades\DB::table('retail_finance_categories')->insert([
                        'tenant_id' => $t,
                        'name' => $ic,
                        'type' => 'income',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }
        $this->info("Done inserting income categories for all retail tenants!");
    }
}
