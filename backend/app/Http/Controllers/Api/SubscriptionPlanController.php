<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessCategory;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionPlanController extends Controller
{
    public function index(Request $request)
    {
        $category = BusinessCategory::where('slug', $request->query('category', 'toko-retail'))->firstOrFail();

        $plans = SubscriptionPlan::where('business_category_id', $category->id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($plans);
    }

    public function createDefaults(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|string|exists:business_categories,slug',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = BusinessCategory::where('slug', $request->input('category'))->firstOrFail();

        $defaults = [
            ['plan_key' => 'free', 'name' => 'Free', 'sort_order' => 0],
            ['plan_key' => 'basic', 'name' => 'Basic', 'sort_order' => 1],
            ['plan_key' => 'pro', 'name' => 'Pro', 'sort_order' => 2],
        ];

        foreach ($defaults as $d) {
            SubscriptionPlan::firstOrCreate(
                ['business_category_id' => $category->id, 'plan_key' => $d['plan_key']],
                [
                    'name' => $d['name'],
                    'price' => null,
                    'max_products' => null,
                    'max_staff' => null,
                    'features' => [],
                    'sort_order' => $d['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        $plans = SubscriptionPlan::where('business_category_id', $category->id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($plans);
    }

    public function update(Request $request, int $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'max_products' => 'nullable|integer|min:0',
            'max_staff' => 'nullable|integer|min:0',
            'features' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan->update($validator->validated());

        return response()->json($plan);
    }
}
