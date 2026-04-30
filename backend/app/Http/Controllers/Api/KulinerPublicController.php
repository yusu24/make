<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\KulinerCategory;
use App\Models\KulinerProduct;

class KulinerPublicController extends Controller
{
    public function getCategories($tenantId)
    {
        $categories = KulinerCategory::where('tenant_id', $tenantId)->get();
        return response()->json($categories);
    }

    public function getProducts(Request $request, $tenantId)
    {
        $query = KulinerProduct::where('tenant_id', $tenantId)->where('is_available', true);
        
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->with('category')->get();
        return response()->json($products);
    }

    public function getProductDetails($id)
    {
        $product = KulinerProduct::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function getSettings()
    {
        // For public demo, we return the first found setting
        // In production, this would be based on domain or tenant slug
        $settings = \App\Models\KulinerSetting::first();
        return response()->json($settings ?: new \stdClass());
    }
}
