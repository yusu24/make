<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\BudidayaInventory;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHarvest;
use App\Observers\BudidayaAuditObserver;
use App\Services\Notifications\WhatsAppNotifierInterface;
use App\Services\Notifications\NullWhatsAppProvider;
use App\Services\Notifications\HttpWhatsAppProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(WhatsAppNotifierInterface::class, function () {
            $configured = config('services.whatsapp.api_url') && config('services.whatsapp.api_token');

            return $configured ? new HttpWhatsAppProvider() : new NullWhatsAppProvider();
        });
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
