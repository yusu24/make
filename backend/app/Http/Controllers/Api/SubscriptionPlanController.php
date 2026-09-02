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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category'        => 'required|string|exists:business_categories,slug',
            'plan_key'        => 'required|string|max:50',
            'name'            => 'required|string|max:255',
            'price'           => 'nullable|numeric|min:0',
            'max_products'    => 'nullable|integer|min:0',
            'max_staff'       => 'nullable|integer|min:0',
            'features'        => 'nullable|array',
            'is_active'       => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'message' => $validator->errors()->first()], 422);
        }

        $category = BusinessCategory::where('slug', $request->input('category'))->firstOrFail();
        $planKey = strtolower(trim(preg_replace('/[^a-zA-Z0-9_-]/', '', $request->input('plan_key'))));

        $maxOrder = SubscriptionPlan::where('business_category_id', $category->id)->max('sort_order') ?? 0;

        $plan = SubscriptionPlan::create([
            'business_category_id' => $category->id,
            'plan_key'             => $planKey ?: ('custom_' . time()),
            'name'                 => $request->input('name'),
            'price'                => $request->filled('price') ? (float)$request->input('price') : 0,
            'max_products'         => $request->filled('max_products') ? (int)$request->input('max_products') : null,
            'max_staff'            => $request->filled('max_staff') ? (int)$request->input('max_staff') : null,
            'features'             => $request->input('features', []),
            'is_active'            => $request->input('is_active', true),
            'sort_order'           => $maxOrder + 1,
        ]);

        return response()->json(['success' => true, 'data' => $plan, 'message' => 'Paket baru berhasil dibuat'], 201);
    }

    public function update(Request $request, int $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'         => 'sometimes|string|max:255',
            'price'        => 'nullable|numeric|min:0',
            'max_products' => 'nullable|integer|min:0',
            'max_staff'    => 'nullable|integer|min:0',
            'features'     => 'sometimes|array',
            'is_active'    => 'sometimes|boolean',
            'sort_order'   => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'message' => $validator->errors()->first()], 422);
        }

        $plan->update($validator->validated());

        return response()->json(['success' => true, 'data' => $plan, 'message' => 'Paket berhasil diperbarui']);
    }

    public function destroy(int $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Prevent deleting built-in default free tier to ensure baseline account creation always works
        if ($plan->plan_key === 'free') {
            return response()->json(['success' => false, 'message' => 'Paket Free adalah paket bawaan sistem dan tidak dapat dihapus.'], 422);
        }

        $plan->delete();

        return response()->json(['success' => true, 'message' => 'Paket berhasil dihapus']);
    }
}
