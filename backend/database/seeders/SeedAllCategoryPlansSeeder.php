<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessCategory;
use App\Models\SubscriptionPlan;

class SeedAllCategoryPlansSeeder extends Seeder

{
    public function run(): void
    {
        $categoriesMeta = [
            'toko-retail'      => ['name' => 'Toko Retail',       'icon' => '🛒', 'color' => '#3b82f6'],
            'budidaya-hewan'    => ['name' => 'Budidaya Hewan',     'icon' => '🐟', 'color' => '#10b981'],
            'budidaya-tanaman' => ['name' => 'Budidaya Tanaman',  'icon' => '🌱', 'color' => '#84cc16'],
            'kuliner'          => ['name' => 'Kuliner',           'icon' => '🍽️', 'color' => '#f59e0b'],
            'jasa'             => ['name' => 'Jasa & Repair',     'icon' => '🛠️', 'color' => '#8b5cf6'],
            'seller'           => ['name' => 'Seller Marketplace','icon' => '📦', 'color' => '#ec4899'],
        ];

        $data = [
            'toko-retail' => [
                ['plan_key' => 'free', 'name' => 'Free', 'price' => null, 'max_products' => 20, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true, 'features' => ['pos'=>true,'inventory'=>true,'suppliers'=>true,'customers'=>true,'discounts'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'apiAccess'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'basic', 'name' => 'Basic', 'price' => 79000, 'max_products' => 200, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true, 'features' => ['pos'=>true,'inventory'=>true,'suppliers'=>true,'customers'=>true,'discounts'=>true,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'apiAccess'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'pro', 'name' => 'Pro', 'price' => 149000, 'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true, 'features' => ['pos'=>true,'inventory'=>true,'suppliers'=>true,'customers'=>true,'discounts'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'apiAccess'=>true,'prioritySupport'=>true]],
            ],
            'budidaya-hewan' => [
                ['plan_key' => 'free', 'name' => 'Free', 'price' => null, 'max_products' => null, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true, 'features' => ['ponds'=>true,'cycles'=>true,'feeding'=>false,'harvest'=>false,'health'=>false,'breeding'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'basic', 'name' => 'Basic', 'price' => 49000, 'max_products' => null, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true, 'features' => ['ponds'=>true,'cycles'=>true,'feeding'=>true,'harvest'=>true,'health'=>true,'breeding'=>false,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false]],
                ['plan_key' => 'pro', 'name' => 'Pro', 'price' => 99000, 'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true, 'features' => ['ponds'=>true,'cycles'=>true,'feeding'=>true,'harvest'=>true,'health'=>true,'breeding'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true]],
            ],
            'budidaya-tanaman' => [
                ['plan_key' => 'free', 'name' => 'Free', 'price' => null, 'max_products' => null, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true, 'features' => ['land'=>true,'cycles'=>true,'fertilizer'=>false,'harvest'=>false,'health'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'basic', 'name' => 'Basic', 'price' => 49000, 'max_products' => null, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true, 'features' => ['land'=>true,'cycles'=>true,'fertilizer'=>true,'harvest'=>true,'health'=>true,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false]],
                ['plan_key' => 'pro', 'name' => 'Pro', 'price' => 99000, 'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true, 'features' => ['land'=>true,'cycles'=>true,'fertilizer'=>true,'harvest'=>true,'health'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true]],
            ],
            'kuliner' => [
                ['plan_key' => 'free', 'name' => 'Free', 'price' => null, 'max_products' => 10, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true, 'features' => ['menu'=>true,'orders'=>true,'tables'=>false,'recipes'=>false,'ingredients'=>false,'modifiers'=>false,'addons'=>false,'bundles'=>false,'waste'=>false,'purchases'=>false,'shifts'=>false,'analytics'=>false,'delivery'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'storefront'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'basic', 'name' => 'Basic', 'price' => 59000, 'max_products' => 50, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true, 'features' => ['menu'=>true,'orders'=>true,'tables'=>true,'recipes'=>true,'ingredients'=>true,'modifiers'=>true,'addons'=>true,'bundles'=>false,'waste'=>true,'purchases'=>true,'shifts'=>true,'analytics'=>false,'delivery'=>false,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'storefront'=>true,'prioritySupport'=>false]],
                ['plan_key' => 'pro', 'name' => 'Pro', 'price' => 129000, 'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true, 'features' => ['menu'=>true,'orders'=>true,'tables'=>true,'recipes'=>true,'ingredients'=>true,'modifiers'=>true,'addons'=>true,'bundles'=>true,'waste'=>true,'purchases'=>true,'shifts'=>true,'analytics'=>true,'delivery'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'storefront'=>true,'prioritySupport'=>true]],
            ],
            'jasa' => [
                ['plan_key' => 'free', 'name' => 'Free', 'price' => null, 'max_products' => null, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true, 'features' => ['workOrders'=>true,'services'=>true,'contracts'=>false,'spareparts'=>false,'finance'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'basic', 'name' => 'Basic', 'price' => 69000, 'max_products' => null, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true, 'features' => ['workOrders'=>true,'services'=>true,'contracts'=>true,'spareparts'=>true,'finance'=>true,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false]],
                ['plan_key' => 'pro', 'name' => 'Pro', 'price' => 119000, 'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true, 'features' => ['workOrders'=>true,'services'=>true,'contracts'=>true,'spareparts'=>true,'finance'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true]],
            ],
            'seller' => [
                ['plan_key' => 'free', 'name' => 'Free', 'price' => null, 'max_products' => null, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true, 'features' => ['inventory'=>true,'marketplace'=>false,'sync'=>false,'shipments'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false]],
                ['plan_key' => 'basic', 'name' => 'Basic', 'price' => 79000, 'max_products' => null, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true, 'features' => ['inventory'=>true,'marketplace'=>true,'sync'=>true,'shipments'=>true,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false]],
                ['plan_key' => 'pro', 'name' => 'Pro', 'price' => 149000, 'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true, 'features' => ['inventory'=>true,'marketplace'=>true,'sync'=>true,'shipments'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true]],
            ],
        ];

        foreach ($data as $slug => $plans) {
            $category = BusinessCategory::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $categoriesMeta[$slug]['name'] ?? ucfirst($slug),
                    'icon' => $categoriesMeta[$slug]['icon'] ?? '🏢',
                    'color' => $categoriesMeta[$slug]['color'] ?? '#3b82f6',
                    'active' => true,
                ]
            );

            foreach ($plans as $plan) {
                SubscriptionPlan::updateOrCreate(
                    ['business_category_id' => $category->id, 'plan_key' => $plan['plan_key']],
                    array_merge($plan, ['business_category_id' => $category->id])
                );
            }
            echo "✅ Seeded plans & features untuk: {$slug}\n";
        }
        echo "Done!\n";
    }
}
