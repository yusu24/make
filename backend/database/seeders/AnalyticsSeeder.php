<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MonthlyRevenue;
use App\Models\PlanDistribution;
use App\Models\CategoryDistribution;
use App\Models\TopTenant;
use App\Models\TenantInvoice;
use App\Models\SubscriptionRequest;

class AnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds to populate SaaS Admin reports and billing lists.
     */
    public function run(): void
    {
        // 1. Truncate existing mock tables
        MonthlyRevenue::truncate();
        PlanDistribution::truncate();
        CategoryDistribution::truncate();
        TopTenant::truncate();

        // 2. Populate Monthly Revenue (Akumulasi Pendapatan SaaS)
        MonthlyRevenue::insert([
            ['year' => 2026, 'month' => 1, 'amount' => 12500000],
            ['year' => 2026, 'month' => 2, 'amount' => 18200000],
            ['year' => 2026, 'month' => 3, 'amount' => 24500000],
            ['year' => 2026, 'month' => 4, 'amount' => 31200000],
            ['year' => 2026, 'month' => 5, 'amount' => 38750000],
            ['year' => 2026, 'month' => 6, 'amount' => 45600000],
            ['year' => 2026, 'month' => 7, 'amount' => 52300000],
            ['year' => 2026, 'month' => 8, 'amount' => 61000000],
            ['year' => 2026, 'month' => 9, 'amount' => 68400000],
        ]);

        // 3. Populate Plan Distribution
        PlanDistribution::insert([
            ['plan_name' => 'Free', 'tenant_count' => 12],
            ['plan_name' => 'Basic', 'tenant_count' => 18],
            ['plan_name' => 'Pro', 'tenant_count' => 15],
            ['plan_name' => 'Enterprise', 'tenant_count' => 5],
        ]);

        // 4. Populate Category Distribution
        CategoryDistribution::insert([
            ['category_name' => 'Retail', 'count' => 21],
            ['category_name' => 'Kuliner', 'count' => 15],
            ['category_name' => 'Jasa', 'count' => 9],
            ['category_name' => 'Budidaya', 'count' => 6],
            ['category_name' => 'Seller', 'count' => 4],
        ]);

        // 5. Populate Top Tenants
        TopTenant::insert([
            ['name' => 'Toko Berkah Sejahtera', 'plan' => 'Pro', 'category' => 'Retail', 'revenue' => 4500000, 'joined' => '12 Jan 2026'],
            ['name' => 'Resto Sedap Rasa', 'plan' => 'Pro', 'category' => 'Kuliner', 'revenue' => 3200000, 'joined' => '05 Feb 2026'],
            ['name' => 'Tambak Vaname Makmur', 'plan' => 'Pro', 'category' => 'Budidaya', 'revenue' => 2800000, 'joined' => '20 Mar 2026'],
            ['name' => 'Auto Service Prima', 'plan' => 'Pro', 'category' => 'Jasa', 'revenue' => 1950000, 'joined' => '01 Apr 2026'],
            ['name' => 'Boutique Fashion Star', 'plan' => 'Pro', 'category' => 'Seller', 'revenue' => 1400000, 'joined' => '15 Mei 2026'],
        ]);
    }
}
