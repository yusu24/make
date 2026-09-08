<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class CleanupDemoSandboxes extends Command
{
    protected $signature = 'demo:cleanup {--all : Hapus semua akun demo sandbox tanpa menunggu heartbeat stale}';
    protected $description = 'Membersihkan akun demo sandbox beserta seluruh data transaksinya secara cepat dan bersih.';

    public function handle()
    {
        $this->info('Memulai pembersihan akun demo sandbox...');

        $forceAll = $this->option('all');
        $deletedCount = self::runCleanup($forceAll);

        $this->info("Berhasil membersihkan {$deletedCount} akun demo sandbox.");
        return 0;
    }

    /**
     * Jalankan pembersihan bulk demo sandboxes.
     * Mengembalikan jumlah akun demo yang berhasil dibersihkan.
     */
    public static function runCleanup(bool $forceAll = false): int
    {
        $staleSince = now()->subMinutes(5);

        $userQuery = User::where(function ($q) use ($forceAll) {
            $q->where('tenant_id', 'like', 'TN-DS-%')
              ->orWhere('tenant_id', 'like', 'TN-DK-%')
              ->orWhere('email', 'like', 'demo-sandbox-%@umkm-demo.com')
              ->orWhere('email', 'like', 'demo-%@umkm-demo.com');

            if ($forceAll) {
                $q->orWhere('email', 'like', '%@demo.com')
                  ->orWhere('tenant_id', 'like', '%DEMO%');
            }
        });

        if (!$forceAll) {
            $userQuery->where(function ($q) use ($staleSince) {
                $q->where('last_seen_at', '<', $staleSince)
                  ->orWhere(function ($q2) use ($staleSince) {
                      $q2->whereNull('last_seen_at')->where('created_at', '<', $staleSince);
                  });
            });
        }

        $demoUsers = $userQuery->get();
        $tenantIdsFromUsers = $demoUsers->pluck('tenant_id')->filter()->unique()->toArray();

        // Cari juga tenant demo di tabel tenants (termasuk orphaned)
        $tenantQuery = Tenant::where(function ($q) use ($forceAll) {
            $q->where('tenant_id', 'like', 'TN-DS-%')
              ->orWhere('tenant_id', 'like', 'TN-DK-%');

            if ($forceAll) {
                $q->orWhere('tenant_id', 'like', '%DEMO%')
                  ->orWhere('business_name', 'like', '%Demo%');
            }
        });

        if (!$forceAll) {
            $tenantQuery->where('created_at', '<', $staleSince);
        }

        $demoTenants = $tenantQuery->get();
        $allTenantIds = array_values(array_unique(array_merge($tenantIdsFromUsers, $demoTenants->pluck('tenant_id')->filter()->toArray())));

        if (empty($allTenantIds) && $demoUsers->isEmpty()) {
            return 0;
        }

        $tablesWithTenant = self::getTablesWithTenantId();
        $safeRun = function (callable $fn) {
            try {
                $fn();
            } catch (\Throwable $e) {
            }
        };

        if (!empty($allTenantIds)) {
            // 1. Dependent item deletions in bulk
            $safeRun(function () use ($allTenantIds) {
                $orderIds = DB::table('orders')->whereIn('tenant_id', $allTenantIds)->pluck('id');
                if ($orderIds->isNotEmpty()) {
                    DB::table('order_items')->whereIn('order_id', $orderIds)->delete();
                }
            });

            $safeRun(function () use ($allTenantIds) {
                $kulinerOrderIds = DB::table('kuliner_orders')->whereIn('tenant_id', $allTenantIds)->pluck('id');
                if ($kulinerOrderIds->isNotEmpty()) {
                    DB::table('kuliner_order_items')->whereIn('order_id', $kulinerOrderIds)->delete();
                }
            });

            $safeRun(function () use ($allTenantIds) {
                $retailTransactionIds = DB::table('retail_transactions')->whereIn('tenant_id', $allTenantIds)->pluck('id');
                if ($retailTransactionIds->isNotEmpty()) {
                    DB::table('retail_transaction_items')->whereIn('transaction_id', $retailTransactionIds)->delete();
                }
            });

            $safeRun(function () use ($allTenantIds) {
                $retailPurchaseIds = DB::table('retail_purchases')->whereIn('tenant_id', $allTenantIds)->pluck('id');
                if ($retailPurchaseIds->isNotEmpty()) {
                    DB::table('retail_purchase_items')->whereIn('purchase_id', $retailPurchaseIds)->delete();
                }
            });

            $safeRun(function () use ($allTenantIds) {
                $budidayaCycleIds = DB::table('budidaya_cycles')->whereIn('tenant_id', $allTenantIds)->pluck('id');
                if ($budidayaCycleIds->isNotEmpty()) {
                    DB::table('budidaya_feedings')->whereIn('cycle_id', $budidayaCycleIds)->delete();
                    DB::table('budidaya_harvests')->whereIn('cycle_id', $budidayaCycleIds)->delete();
                    DB::table('budidaya_healths')->whereIn('cycle_id', $budidayaCycleIds)->delete();
                }
            });

            // 2. Bulk delete across all tables by tenant_id
            foreach ($tablesWithTenant as $tableName) {
                $safeRun(function () use ($tableName, $allTenantIds) {
                    DB::table($tableName)->whereIn('tenant_id', $allTenantIds)->delete();
                });
            }

            // 3. Delete users and tenants in bulk
            $safeRun(function () use ($allTenantIds) {
                DB::table('users')->whereIn('tenant_id', $allTenantIds)->delete();
                DB::table('tenants')->whereIn('tenant_id', $allTenantIds)->delete();
            });
        }

        // Delete any remaining demo users by id
        if ($demoUsers->isNotEmpty()) {
            $userIds = $demoUsers->pluck('id')->toArray();
            $safeRun(function () use ($userIds) {
                DB::table('users')->whereIn('id', $userIds)->delete();
            });
        }

        return max(count($allTenantIds), $demoUsers->count());
    }

    public static function getTablesWithTenantId(): array
    {
        $tablesWithTenant = [];
        try {
            $dbName = config('database.connections.mysql.database');
            $results = DB::select("
                SELECT DISTINCT TABLE_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = 'tenant_id'
            ", [$dbName]);

            foreach ($results as $row) {
                $tableName = $row->TABLE_NAME ?? $row->table_name ?? null;
                if ($tableName && !in_array($tableName, ['tenants', 'users'])) {
                    $tablesWithTenant[] = $tableName;
                }
            }
        } catch (\Throwable $e) {
            $tablesWithTenant = [];
        }

        if (empty($tablesWithTenant)) {
            $tablesWithTenant = [
                'activity_logs', 'orders', 'order_items', 'kuliner_orders', 'kuliner_order_items',
                'kuliner_tables', 'kuliner_settings', 'kuliner_categories', 'kuliner_menus',
                'kuliner_roles', 'kuliner_expenses', 'kuliner_recipes', 'kuliner_ingredients',
                'kuliner_suppliers', 'kuliner_purchases', 'kuliner_reviews', 'retail_categories',
                'retail_units', 'retail_products', 'retail_transactions', 'retail_transaction_items',
                'retail_purchases', 'retail_purchase_items', 'retail_suppliers', 'retail_customers',
                'retail_expenses', 'retail_finance_categories', 'retail_settings', 'retail_roles',
                'retail_stock_opnames', 'retail_stock_opname_items', 'retail_stock_transfers',
                'retail_stock_transfer_items', 'retail_payables', 'retail_payable_payments',
                'retail_receivables', 'retail_receivable_payments', 'retail_pricelists',
                'retail_pricelist_items', 'retail_customer_returns', 'retail_customer_return_items',
                'retail_supplier_returns', 'retail_supplier_return_items', 'budidaya_settings',
                'budidaya_units', 'budidaya_roles', 'budidaya_ponds', 'budidaya_cycles',
                'budidaya_feedings', 'budidaya_harvests', 'budidaya_healths', 'budidaya_feeds',
                'budidaya_expenses', 'jasa_settings', 'jasa_services', 'jasa_orders',
                'jasa_technicians', 'jasa_spareparts', 'seller_warehouses', 'seller_channels',
                'seller_products', 'seller_orders', 'invoices', 'tenant_modules', 'tenant_verifications'
            ];
        }

        return $tablesWithTenant;
    }
}