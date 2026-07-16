<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessCategory;
use App\Models\SubscriptionPlan;

class SeedAllCategoryPlansSeeder extends Seeder

{
    public function run(): void
    {
        $data = [
            'budidaya-ikan' => [
                [
                    'plan_key' => 'free', 'name' => 'Free', 'price' => null,
                    'max_products' => null, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true,
                    'features' => ['ponds'=>true,'cycles'=>true,'feeding'=>false,'harvest'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false],
                ],
                [
                    'plan_key' => 'basic', 'name' => 'Basic', 'price' => 49000,
                    'max_products' => null, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true,
                    'features' => ['ponds'=>true,'cycles'=>true,'feeding'=>true,'harvest'=>true,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false],
                ],
                [
                    'plan_key' => 'pro', 'name' => 'Pro', 'price' => 99000,
                    'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true,
                    'features' => ['ponds'=>true,'cycles'=>true,'feeding'=>true,'harvest'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true],
                ],
            ],
            'budidaya-tanaman' => [
                [
                    'plan_key' => 'free', 'name' => 'Free', 'price' => null,
                    'max_products' => null, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true,
                    'features' => ['land'=>true,'cycles'=>true,'fertilizer'=>false,'harvest'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false],
                ],
                [
                    'plan_key' => 'basic', 'name' => 'Basic', 'price' => 49000,
                    'max_products' => null, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true,
                    'features' => ['land'=>true,'cycles'=>true,'fertilizer'=>true,'harvest'=>true,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false],
                ],
                [
                    'plan_key' => 'pro', 'name' => 'Pro', 'price' => 99000,
                    'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true,
                    'features' => ['land'=>true,'cycles'=>true,'fertilizer'=>true,'harvest'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true],
                ],
            ],
            'kuliner' => [
                [
                    'plan_key' => 'free', 'name' => 'Free', 'price' => null,
                    'max_products' => 10, 'max_staff' => 1, 'sort_order' => 0, 'is_active' => true,
                    'features' => ['menu'=>true,'orders'=>true,'tables'=>false,'delivery'=>false,'reports'=>false,'multiUser'=>false,'exportExcel'=>false,'prioritySupport'=>false],
                ],
                [
                    'plan_key' => 'basic', 'name' => 'Basic', 'price' => 59000,
                    'max_products' => 50, 'max_staff' => 3, 'sort_order' => 1, 'is_active' => true,
                    'features' => ['menu'=>true,'orders'=>true,'tables'=>true,'delivery'=>false,'reports'=>true,'multiUser'=>false,'exportExcel'=>true,'prioritySupport'=>false],
                ],
                [
                    'plan_key' => 'pro', 'name' => 'Pro', 'price' => 129000,
                    'max_products' => null, 'max_staff' => null, 'sort_order' => 2, 'is_active' => true,
                    'features' => ['menu'=>true,'orders'=>true,'tables'=>true,'delivery'=>true,'reports'=>true,'multiUser'=>true,'exportExcel'=>true,'prioritySupport'=>true],
                ],
            ],
        ];

        foreach ($data as $slug => $plans) {
            $category = BusinessCategory::where('slug', $slug)->first();
            if (!$category) {
                echo "Kategori tidak ditemukan: $slug\n";
                continue;
            }
            foreach ($plans as $plan) {
                SubscriptionPlan::updateOrCreate(
                    ['business_category_id' => $category->id, 'plan_key' => $plan['plan_key']],
                    array_merge($plan, ['business_category_id' => $category->id])
                );
            }
            echo "✅ Seeded plans untuk: $slug\n";
        }
        echo "Done!\n";
    }
}
