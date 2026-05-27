<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MonthlyRevenue;
use App\Models\PlanDistribution;
use App\Models\CategoryDistribution;
use App\Models\TopTenant;

class AnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MonthlyRevenue::truncate();
        PlanDistribution::truncate();
        CategoryDistribution::truncate();
        TopTenant::truncate();

        MonthlyRevenue::insert([
            ['year' => 2026, 'month' => 1, 'amount' => 12500000],
            ['year' => 2026, 'month' => 2, 'amount' => 18200000],
            ['year' => 2026, 'month' => 3, 'amount' => 24500000],
            ['year' => 2026, 'month' => 4, 'amount' => 35140000],
            ['year' => 2026, 'month' => 5, 'amount' => 42000000],
        ]);

        PlanDistribution::insert([
            ['plan_name' => 'Free', 'tenant_count' => 120],
            ['plan_name' => 'Basic', 'tenant_count' => 180],
            ['plan_name' => 'Pro', 'tenant_count' => 150],
        ]);

        CategoryDistribution::insert([
            ['category_name' => 'Retail', 'count' => 210],
            ['category_name' => 'F&B', 'count' => 150],
            ['category_name' => 'Jasa', 'count' => 90],
        ]);

        TopTenant::insert([
            ['name' => 'Toko Maju Jaya', 'plan' => 'Pro', 'category' => 'Retail', 'revenue' => 2500000, 'joined' => '12 Jan 2026'],
            ['name' => 'Warteg Bahagia', 'plan' => 'Basic', 'category' => 'F&B', 'revenue' => 1200000, 'joined' => '05 Feb 2026'],
            ['name' => 'Laundry Bersih', 'plan' => 'Pro', 'category' => 'Jasa', 'revenue' => 1800000, 'joined' => '20 Mar 2026'],
            ['name' => 'Klinik Sehat', 'plan' => 'Pro', 'category' => 'Jasa', 'revenue' => 3500000, 'joined' => '01 Apr 2026'],
            ['name' => 'Cafe Senja', 'plan' => 'Basic', 'category' => 'F&B', 'revenue' => 2100000, 'joined' => '15 May 2026'],
        ]);
    }
}
