<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BusinessCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class BusinessCategoryController extends Controller
{
    // Public listing (for landing page & registration)
    public function publicIndex()
    {
        $categories = BusinessCategory::where('active', true)
            ->orderBy('sort_order')
            ->get([
                'id', 'name', 'slug', 'icon', 'color',
                'description', 'features_list',
                'promo_active', 'promo_text', 'discount_pct',
            ]);
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function index()
    {
        $categories = BusinessCategory::withCount('tenants', 'users')
            ->orderBy('sort_order')
            ->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:100|unique:business_categories,name',
            'description'  => 'nullable|string',
            'icon'         => 'nullable|string',
            'color'        => 'nullable|string',
            'promo_text'   => 'nullable|string',
            'discount_pct' => 'nullable|integer|min:0|max:100',
            'promo_active' => 'nullable|boolean',
            'features_list' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category = BusinessCategory::create([
            'name'         => $request->name,
            'slug'         => Str::slug($request->name),
            'description'  => $request->description,
            'icon'         => $request->icon ?? '🏢',
            'color'        => $request->color ?? '#3b82f6',
            'active'       => $request->active ?? true,
            'promo_text'   => $request->promo_text,
            'discount_pct' => $request->discount_pct ?? 0,
            'promo_active' => $request->promo_active ?? false,
            'features_list' => $request->features_list,
        ]);

        ActivityLog::record('create_category', 'Kategori: ' . $category->name, 'success');

        return response()->json(['success' => true, 'message' => 'Kategori berhasil dibuat', 'data' => $category], 201);
    }

    public function update(Request $request, BusinessCategory $businessCategory)
    {
        $businessCategory->update([
            'name'         => $request->name ?? $businessCategory->name,
            'slug'         => $request->name ? Str::slug($request->name) : $businessCategory->slug,
            'description'  => $request->description ?? $businessCategory->description,
            'icon'         => $request->icon ?? $businessCategory->icon,
            'color'        => $request->color ?? $businessCategory->color,
            'active'       => $request->has('active') ? $request->active : $businessCategory->active,
            'promo_text'   => $request->has('promo_text') ? $request->promo_text : $businessCategory->promo_text,
            'discount_pct' => $request->has('discount_pct') ? $request->discount_pct : $businessCategory->discount_pct,
            'promo_active' => $request->has('promo_active') ? $request->promo_active : $businessCategory->promo_active,
            'features_list' => $request->has('features_list') ? $request->features_list : $businessCategory->features_list,
        ]);

        ActivityLog::record('edit_category', 'Kategori: ' . $businessCategory->name, 'info');
        return response()->json(['success' => true, 'message' => 'Kategori diperbarui', 'data' => $businessCategory]);
    }

    public function destroy(BusinessCategory $businessCategory)
    {
        if ($businessCategory->tenants()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Kategori memiliki tenant aktif, tidak dapat dihapus'], 422);
        }
        ActivityLog::record('delete_category', 'Kategori: ' . $businessCategory->name, 'danger');
        $businessCategory->delete();
        return response()->json(['success' => true, 'message' => 'Kategori dihapus']);
    }

    public function toggle(BusinessCategory $businessCategory)
    {
        $businessCategory->update(['active' => !$businessCategory->active]);
        ActivityLog::record('toggle_category', 'Kategori: ' . $businessCategory->name, 'warning');
        return response()->json(['success' => true, 'message' => 'Status kategori diperbarui', 'data' => $businessCategory]);
    }
}
