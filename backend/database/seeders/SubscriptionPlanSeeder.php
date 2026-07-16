<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $retail = BusinessCategory::where('slug', 'toko-retail')->first();
        if (!$retail) {
            return;
        }

        $plans = [
            [
                'plan_key' => 'free',
                'name' => 'Free',
                'max_products' => 20,
                'max_staff' => 1,
                'features' => [
                    'pos' => true, 'inventory' => true, 'suppliers' => false, 'customers' => false,
                    'reports' => false, 'multiUser' => false, 'apiAccess' => false,
                    'prioritySupport' => false, 'customDomain' => false, 'exportExcel' => false,
                ],
                'sort_order' => 1,
            ],
            [
                'plan_key' => 'basic',
                'name' => 'Basic',
                'max_products' => 500,
                'max_staff' => 5,
                'features' => [
                    'pos' => true, 'inventory' => true, 'suppliers' => true, 'customers' => true,
                    'reports' => true, 'multiUser' => false, 'apiAccess' => false,
                    'prioritySupport' => false, 'customDomain' => false, 'exportExcel' => true,
                ],
                'sort_order' => 2,
            ],
            [
                'plan_key' => 'pro',
                'name' => 'Pro',
                'max_products' => null,
                'max_staff' => null,
                'features' => [
                    'pos' => true, 'inventory' => true, 'suppliers' => true, 'customers' => true,
                    'reports' => true, 'multiUser' => true, 'apiAccess' => true,
                    'prioritySupport' => true, 'customDomain' => true, 'exportExcel' => true,
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['business_category_id' => $retail->id, 'plan_key' => $plan['plan_key']],
                $plan
            );
        }
    }
}
