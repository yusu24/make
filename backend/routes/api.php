<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessCategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RetailMasterController;
use App\Http\Controllers\Api\RetailStaffController;
use App\Http\Controllers\Api\RetailRoleController;
use App\Models\Tenant;
use App\Http\Controllers\Api\RetailReportController;
use App\Http\Controllers\Api\RetailProductController;
use App\Http\Controllers\Api\RetailTransactionController;
use App\Http\Controllers\Api\RetailPurchaseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// Fallback for Sanctum unauthenticated redirect
Route::get('login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// Public category list (for registration form)
Route::get('categories/public', [BusinessCategoryController::class, 'publicIndex']);

// ─── AUTHENTICATED ROUTES ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',     [AuthController::class, 'me']);
    });

    // Profile
    Route::put('profile', [ProfileController::class, 'update']);
    Route::get('logs', [ActivityLogController::class, 'index']);

    // Core System Routes (Protected by Tenant Isolation)
    Route::middleware(['tenant'])->group(function () {
        
        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Products (Requires inventory module)
        Route::middleware(['check_module:inventory'])->group(function () {
            Route::get('products', [ProductController::class, 'index']);
            Route::post('products', [ProductController::class, 'store']);
        });

        // Transactions (Requires retail_pos module)
        Route::middleware(['check_module:retail_pos'])->group(function () {
            Route::get('transactions', [TransactionController::class, 'index']);
            Route::post('transactions', [TransactionController::class, 'store']);
            Route::post('retail/pos', [\App\Http\Controllers\Api\Retail\RetailPosController::class, 'store']);
        });

        // Budidaya Cycles (Requires budidaya_cycle module)
        Route::middleware(['check_module:budidaya_cycle'])->group(function () {
            Route::get('budidaya/cycles', [\App\Http\Controllers\Api\Budidaya\BudidayaCycleController::class, 'index']);
            Route::post('budidaya/cycles/start', [\App\Http\Controllers\Api\Budidaya\BudidayaCycleController::class, 'start']);
            
            // Core Budidaya API
            Route::post('budidaya/pond', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storePond']);
            Route::post('budidaya/cycle', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeCycle']);
            Route::post('budidaya/expense', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeExpense']);
            Route::post('budidaya/harvest', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeHarvest']);
        });

        // Culinary Admin Routes (Accessible for all culinary tenants)
        Route::prefix('kuliner/admin')->group(function () {
            Route::get('categories', [\App\Http\Controllers\Api\KulinerController::class, 'getCategories']);
            Route::post('categories', [\App\Http\Controllers\Api\KulinerController::class, 'storeCategory']);
            Route::put('categories/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'updateCategory']);
            Route::delete('categories/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'destroyCategory']);
            Route::get('products', [\App\Http\Controllers\Api\KulinerController::class, 'getProducts']);
            Route::post('products', [\App\Http\Controllers\Api\KulinerController::class, 'storeProduct']);
            Route::put('products/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'updateProduct']);
            Route::delete('products/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'destroyProduct']);
            Route::get('settings', [\App\Http\Controllers\Api\KulinerController::class, 'getAdminSettings']);
            Route::post('settings', [\App\Http\Controllers\Api\KulinerController::class, 'updateAdminSettings']);
            Route::get('staff', [\App\Http\Controllers\Api\KulinerController::class, 'getStaff']);
            Route::post('staff', [\App\Http\Controllers\Api\KulinerController::class, 'storeStaff']);
            Route::put('staff/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'updateStaff']);
            Route::delete('staff/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'destroyStaff']);
            
            // Orders
            Route::get('orders', [\App\Http\Controllers\Api\KulinerController::class, 'getOrders']);
            Route::patch('orders/{id}/status', [\App\Http\Controllers\Api\KulinerController::class, 'updateOrderStatus']);
            Route::get('dashboard/stats', [\App\Http\Controllers\Api\KulinerController::class, 'getDashboardStats']);
            Route::get('analytics', [\App\Http\Controllers\Api\KulinerController::class, 'getAnalytics']);
            Route::get('testimonials', [\App\Http\Controllers\Api\KulinerController::class, 'getAdminTestimonials']);
            Route::patch('testimonials/{id}/status', [\App\Http\Controllers\Api\KulinerController::class, 'updateTestimonialStatus']);
        });

        // Website Orders (Requires website_order module)
        Route::middleware(['check_module:website_order'])->group(function () {
            // Other protected routes for website orders
        });
    });

    // Public Storefront (Outside Sanctum)
    Route::get('storefront/{slug}', [\App\Http\Controllers\Api\KulinerController::class, 'storefront']);

    Route::prefix('admin')->middleware('is_admin')->group(function () {
        Route::get('staff', [\App\Http\Controllers\Api\RetailStaffController::class, 'index']);
        Route::get('tenants', [TenantController::class, 'index']);
        Route::post('tenants', [TenantController::class, 'store']);
        Route::put('tenants/{tenant_id}/plan', [TenantController::class, 'updatePlan']);
        Route::get('tenants/{tenant_id}/modules', [TenantController::class, 'getModules']);
        Route::post('tenants/{tenant_id}/modules', [TenantController::class, 'updateModules']);
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::post('tenants/{tenant_id}/impersonate', [\App\Http\Controllers\Api\ImpersonateController::class, 'impersonate']);
    });
});

// ─── KULINER PUBLIC ROUTES (NO AUTH REQUIRED) ───────────────────────────────
Route::prefix('kuliner/public')->group(function () {
    Route::get('settings', [\App\Http\Controllers\Api\KulinerController::class, 'getSettings']);
    Route::get('best-sellers', [\App\Http\Controllers\Api\KulinerController::class, 'getBestSellers']);
    Route::get('categories', [\App\Http\Controllers\Api\KulinerController::class, 'getPublicCategories']);
    Route::get('products', [\App\Http\Controllers\Api\KulinerController::class, 'getPublicProducts']);
    Route::post('orders', [\App\Http\Controllers\Api\KulinerController::class, 'placeOrder']);
    Route::get('testimonials', [\App\Http\Controllers\Api\KulinerController::class, 'getPublicTestimonials']);
    Route::post('testimonials', [\App\Http\Controllers\Api\KulinerController::class, 'submitTestimonial']);
});
