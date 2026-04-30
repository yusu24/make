<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\BudidayaInventory;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHarvest;
use App\Observers\BudidayaAuditObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Observers for Audit Trail
        BudidayaInventory::observe(BudidayaAuditObserver::class);
        BudidayaFeeding::observe(BudidayaAuditObserver::class);
        BudidayaHarvest::observe(BudidayaAuditObserver::class);
    }
}
