<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use App\Models\KulinerCategory;
use App\Models\KulinerProduct;
use App\Models\KulinerOrder;
use App\Models\KulinerSetting;

class KulinerAdminController extends Controller
{
    // Dashboard Stats
    public function getDashboardStats(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $totalSales = KulinerOrder::where('tenant_id', $tenantId)->where('status', 'completed')->sum('total_price');
        $totalOrders = KulinerOrder::where('tenant_id', $tenantId)->count();
        $pendingOrders = KulinerOrder::where('tenant_id', $tenantId)->where('status', 'pending')->count();
        $totalProducts = KulinerProduct::where('tenant_id', $tenantId)->count();

        return response()->json([
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'total_products' => $totalProducts,
        ]);
    }

    // Categories
    public function getCategories(Request $request)
    {
        return response()->json(KulinerCategory::where('tenant_id', $request->user()->tenant_id)->get());
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $category = KulinerCategory::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'description' => $request->description,
            'image_url' => $request->image_url,
        ]);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = KulinerCategory::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        
        $data = $request->only(['name', 'description', 'image_url']);
        if ($request->has('name') && $request->name !== $category->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(5);
        }

        $category->update($data);
        return response()->json($category);
    }

    public function destroyCategory(Request $request, $id)
    {
        $category = KulinerCategory::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    // Products
    public function getProducts(Request $request)
    {
        return response()->json(KulinerProduct::where('tenant_id', $request->user()->tenant_id)->with('category')->get());
    }

    public function storeProduct(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:kuliner_categories,id',
            'name' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
        ]);
        $product = KulinerProduct::create([
            'tenant_id' => $request->user()->tenant_id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image_url' => $request->image_url,
            'is_available' => $request->is_available ?? true,
        ]);
        return response()->json($product, 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $product->update($request->all());
        return response()->json($product);
    }

    public function destroyProduct(Request $request, $id)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    // Orders
    public function getOrders(Request $request)
    {
        $query = KulinerOrder::where('tenant_id', $request->user()->tenant_id)->with(['items.product', 'user']);
        
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,processing,completed,cancelled']);
        $order = KulinerOrder::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $order->update(['status' => $request->status]);
        return response()->json($order);
    }

    // Settings
    public function getSettings(Request $request)
    {
        $settings = KulinerSetting::where('tenant_id', $request->user()->tenant_id)->first();
        if (!$settings) {
            // Return default/empty settings if not found
            return response()->json([
                'store_name' => 'Dapur Nusantara',
                'hero_title' => 'Cita Rasa Autentik Nusantara',
                'hero_subtitle' => 'Nikmati kelezatan masakan tradisional Indonesia yang diracik dengan rempah pilihan dan cinta, langsung dari dapur nenek moyang.',
            ]);
        }
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $data = $request->only([
            'store_name', 'address', 'phone', 'opening_hours', 
            'hero_title', 'hero_subtitle', 'promo_title', 'promo_desc', 
            'instagram_url', 'whatsapp_number', 'logo_url'
        ]);

        $settings = KulinerSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            $data
        );
        
        return response()->json($settings);
    }
}
