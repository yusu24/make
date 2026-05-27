<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessCategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SaasRoleController;
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
use App\Http\Controllers\Api\SubscriptionRequestController;
use App\Http\Controllers\Api\LandingSettingController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\AdminFinanceController;
use App\Http\Controllers\Api\AdminAnalyticsController;

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
Route::get('landing-settings', [LandingSettingController::class, 'get']);
Route::get('testimonials/public', [TestimonialController::class, 'publicIndex']);
Route::post('testimonials/public-submit', [TestimonialController::class, 'publicSubmit']);

// ─── AUTHENTICATED ROUTES ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',     [AuthController::class, 'me']);
        Route::post('impersonate/{id}', [\App\Http\Controllers\Api\ImpersonateController::class, 'impersonateUser']);
    });

    // Profile
    Route::put('profile', [ProfileController::class, 'update']);
    Route::get('logs', [ActivityLogController::class, 'index']);

    // User & Admin Management
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);

    Route::get('admins', function(Request $request) {
        $request->merge(['role' => ['admin', 'super_admin']]);
        return app(UserController::class)->index($request);
    });
    Route::post('admins', [UserController::class, 'store']);
    Route::delete('admins/{user}', [UserController::class, 'destroy']);
    Route::apiResource('saas-roles', SaasRoleController::class);

    // Business Categories management (Admin/System level)
    Route::get('categories', [BusinessCategoryController::class, 'index']);
    Route::post('categories', [BusinessCategoryController::class, 'store']);
    Route::put('categories/{businessCategory}', [BusinessCategoryController::class, 'update']);
    Route::delete('categories/{businessCategory}', [BusinessCategoryController::class, 'destroy']);
    Route::patch('categories/{businessCategory}/toggle', [BusinessCategoryController::class, 'toggle']);

    // Finance / Invoice Management (SaaS Admin)
    Route::prefix('admin/finance')->group(function () {
        Route::get('invoices', [AdminFinanceController::class, 'index']);
        Route::post('invoices', [AdminFinanceController::class, 'store']);
        Route::get('stats', [AdminFinanceController::class, 'stats']);
        Route::patch('invoices/{id}/pay', [AdminFinanceController::class, 'markPaid']);
    });

    // Support Ticket Management (SaaS Admin)
    Route::prefix('admin/support')->group(function () {
        Route::get('tickets', [\App\Http\Controllers\Api\AdminSupportController::class, 'index']);
        Route::post('tickets', [\App\Http\Controllers\Api\AdminSupportController::class, 'store']);
        Route::patch('tickets/{id}/status', [\App\Http\Controllers\Api\AdminSupportController::class, 'updateStatus']);
    });

    // Tenant subscription routes
    Route::get('subscription/current', [SubscriptionRequestController::class, 'current']);
    Route::post('subscription/request', [SubscriptionRequestController::class, 'store']);

    // Core System Routes (Protected by Tenant Isolation)
    Route::middleware(['tenant'])->group(function () {
        
        // Tenant Support Center (All Tenants)
        Route::prefix('support')->group(function () {
            Route::get('tickets', [\App\Http\Controllers\Api\TenantSupportController::class, 'index']);
            Route::post('tickets', [\App\Http\Controllers\Api\TenantSupportController::class, 'store']);
        });


        // ─── RETAIL TENANT ENDPOINTS ─────────────────────────────────────────
        Route::prefix('retail')->group(function () {
            // Categories
            Route::get('categories', [RetailMasterController::class, 'getCategories']);
            Route::post('categories', [RetailMasterController::class, 'storeCategory']);
            Route::put('categories/{id}', [RetailMasterController::class, 'updateCategory']);
            Route::delete('categories/{id}', [RetailMasterController::class, 'destroyCategory']);

            // Roles
            Route::get('roles', [RetailRoleController::class, 'index']);
            Route::post('roles', [RetailRoleController::class, 'store']);
            Route::put('roles/{id}', [RetailRoleController::class, 'update']);
            Route::delete('roles/{id}', [RetailRoleController::class, 'destroy']);

            // Staff
            Route::get('staff', [RetailStaffController::class, 'index']);
            Route::post('staff', [RetailStaffController::class, 'store']);
            Route::put('staff/{id}', [RetailStaffController::class, 'update']);
            Route::delete('staff/{id}', [RetailStaffController::class, 'destroy']);

            // Suppliers
            Route::get('suppliers', [RetailMasterController::class, 'getSuppliers']);
            Route::post('suppliers', [RetailMasterController::class, 'storeSupplier']);
            Route::put('suppliers/{id}', [RetailMasterController::class, 'updateSupplier']);
            Route::delete('suppliers/{id}', [RetailMasterController::class, 'destroySupplier']);

            // Customers
            Route::get('customers', [RetailMasterController::class, 'getCustomers']);
            Route::post('customers', [RetailMasterController::class, 'storeCustomer']);
            Route::put('customers/{id}', [RetailMasterController::class, 'updateCustomer']);
            Route::delete('customers/{id}', [RetailMasterController::class, 'destroyCustomer']);

            // Units
            Route::get('units', [RetailMasterController::class, 'getUnits']);
            Route::post('units', [RetailMasterController::class, 'storeUnit']);
            Route::put('units/{id}', [RetailMasterController::class, 'updateUnit']);
            Route::delete('units/{id}', [RetailMasterController::class, 'destroyUnit']);
            
            // Expense Categories
            Route::get('expense-categories', [RetailMasterController::class, 'getExpenseCategories']);
            Route::post('expense-categories', [RetailMasterController::class, 'storeExpenseCategory']);
            Route::put('expense-categories/{id}', [RetailMasterController::class, 'updateExpenseCategory']);
            Route::delete('expense-categories/{id}', [RetailMasterController::class, 'destroyExpenseCategory']);
            
            // Products
            Route::get('products', [RetailProductController::class, 'index']);
            Route::post('products', [RetailProductController::class, 'store']);
            Route::put('products/{id}', [RetailProductController::class, 'update']);
            Route::delete('products/{id}', [RetailProductController::class, 'destroy']);

            // Transactions (POS)
            Route::post('transactions', [RetailTransactionController::class, 'store']);

            // Purchases (Restok)
            Route::get('purchases', [RetailPurchaseController::class, 'index']);
            Route::post('purchases', [RetailPurchaseController::class, 'store']);
            
            // Finance (Keuangan Sederhana)
            Route::get('finance/summary', [\App\Http\Controllers\Api\RetailFinanceController::class, 'getSummary']);
            Route::get('finance/expenses', [\App\Http\Controllers\Api\RetailFinanceController::class, 'index']);
            Route::post('finance/expenses', [\App\Http\Controllers\Api\RetailFinanceController::class, 'store']);
            Route::put('finance/expenses/{id}', [\App\Http\Controllers\Api\RetailFinanceController::class, 'update']);
            Route::delete('finance/expenses/{id}', [\App\Http\Controllers\Api\RetailFinanceController::class, 'destroy']);

            Route::get('reports', [RetailReportController::class, 'getReports']);
        });

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

        // ─── BUDIDAYA (AQUACULTURE) ENDPOINTS ───────────────────────────────────
        Route::prefix('budidaya')->group(function () {
            Route::get('dashboard/stats', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'dashboardStats']);
            Route::get('reports/ponds', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'pondReport']);
            Route::get('reports/harvest', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'harvestSummary']);

            // Ponds
            Route::apiResource('ponds', \App\Http\Controllers\Api\Budidaya\PondController::class);

            // Staff
            Route::get('staff', [\App\Http\Controllers\Api\Budidaya\StaffController::class, 'index']);
            Route::post('staff', [\App\Http\Controllers\Api\Budidaya\StaffController::class, 'store']);
            Route::put('staff/{id}', [\App\Http\Controllers\Api\Budidaya\StaffController::class, 'update']);
            Route::delete('staff/{id}', [\App\Http\Controllers\Api\Budidaya\StaffController::class, 'destroy']);

            // Roles
            Route::get('roles', [\App\Http\Controllers\Api\Budidaya\RoleController::class, 'index']);
            Route::post('roles', [\App\Http\Controllers\Api\Budidaya\RoleController::class, 'store']);
            Route::put('roles/{id}', [\App\Http\Controllers\Api\Budidaya\RoleController::class, 'update']);
            Route::delete('roles/{id}', [\App\Http\Controllers\Api\Budidaya\RoleController::class, 'destroy']);

            // Feed Stocks
            Route::get('feeds', [\App\Http\Controllers\Api\Budidaya\FeedController::class, 'index']);
            Route::post('feeds', [\App\Http\Controllers\Api\Budidaya\FeedController::class, 'store']);
            Route::put('feeds/{id}/add', [\App\Http\Controllers\Api\Budidaya\FeedController::class, 'addStock']);

            // Cycles
            Route::get('cycles', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'index']);
            Route::get('cycles/{id}', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'show']);
            Route::post('cycles', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'store']);
            Route::post('cycles/{id}/harvest', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'harvest']);
            
            // Cycle Logs
            Route::post('feedings', [\App\Http\Controllers\Api\Budidaya\FeedController::class, 'logFeeding']);
            Route::delete('feedings/{id}', [\App\Http\Controllers\Api\Budidaya\FeedController::class, 'destroyFeedingLog']);
            
            Route::post('health', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'logHealth']);
            Route::post('samplings', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'logSampling']);

            // Finance
            Route::apiResource('expenses', \App\Http\Controllers\Api\Budidaya\FinanceController::class)->except(['show', 'update']);
            
            // Legacy / Helper endpoints
            Route::post('cycles/start', [\App\Http\Controllers\Api\Budidaya\BudidayaCycleController::class, 'start']);
            Route::post('pond', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storePond']);
            Route::post('cycle', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeCycle']);
            Route::post('expense', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeExpense']);
            Route::post('harvest', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeHarvest']);
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
            Route::get('ledger', [\App\Http\Controllers\Api\KulinerController::class, 'getLedger']);
            Route::post('expenses', [\App\Http\Controllers\Api\KulinerController::class, 'storeExpense']);
            Route::get('dashboard/stats', [\App\Http\Controllers\Api\KulinerController::class, 'getDashboardStats']);
            Route::get('analytics', [\App\Http\Controllers\Api\KulinerController::class, 'getAnalytics']);
            Route::get('testimonials', [\App\Http\Controllers\Api\KulinerController::class, 'getAdminTestimonials']);
            Route::patch('testimonials/{id}/status', [\App\Http\Controllers\Api\KulinerController::class, 'updateTestimonialStatus']);

            // Promos
            Route::get('promos', [\App\Http\Controllers\Api\KulinerController::class, 'getPromos']);
            Route::post('promos', [\App\Http\Controllers\Api\KulinerController::class, 'storePromo']);
            Route::put('promos/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'updatePromo']);
            Route::delete('promos/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'destroyPromo']);

            // Roles
            Route::get('roles', [\App\Http\Controllers\Api\KulinerController::class, 'getRoles']);
            Route::post('roles', [\App\Http\Controllers\Api\KulinerController::class, 'storeRole']);
            Route::put('roles/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'updateRole']);
            Route::delete('roles/{id}', [\App\Http\Controllers\Api\KulinerController::class, 'destroyRole']);
        });

        // Website Orders (Requires website_order module)
        Route::middleware(['check_module:website_order'])->group(function () {
            // Other protected routes for website orders
        });
    });

    // Public Storefront (Outside Sanctum)
    Route::get('storefront/{slug}', [\App\Http\Controllers\Api\KulinerController::class, 'storefront']);

    Route::prefix('admin')->middleware('is_admin')->group(function () {
        Route::get('staff', [RetailStaffController::class, 'index']);
        Route::get('tenants', [TenantController::class, 'index']);
        Route::post('tenants', [TenantController::class, 'store']);
        Route::put('tenants/{tenant_id}/plan', [TenantController::class, 'updatePlan']);
        Route::get('tenants/{tenant_id}/modules', [TenantController::class, 'getModules']);
        Route::post('tenants/{tenant_id}/modules', [TenantController::class, 'updateModules']);
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::post('tenants/{tenant_id}/impersonate', [\App\Http\Controllers\Api\ImpersonateController::class, 'impersonateUser']);

        // Analytics
        Route::get('analytics/monthly-revenue', [AdminAnalyticsController::class, 'monthlyRevenue']);
        Route::get('analytics/plan-distribution', [AdminAnalyticsController::class, 'planDistribution']);
        Route::get('analytics/category-distribution', [AdminAnalyticsController::class, 'categoryDistribution']);
        Route::get('analytics/top-tenants', [AdminAnalyticsController::class, 'topTenants']);

        // Categories & Subscription Requests
        Route::get('categories', [BusinessCategoryController::class, 'index']);
        Route::get('subscription/requests', [SubscriptionRequestController::class, 'index']);
        Route::post('subscription/requests/{id}/approve', [SubscriptionRequestController::class, 'approve']);
        Route::post('subscription/requests/{id}/reject', [SubscriptionRequestController::class, 'reject']);
        Route::post('landing-settings', [LandingSettingController::class, 'update']);
        Route::get('testimonials', [TestimonialController::class, 'index']);
        Route::post('testimonials', [TestimonialController::class, 'store']);
        Route::put('testimonials/{testimonial}', [TestimonialController::class, 'update']);
        Route::delete('testimonials/{testimonial}', [TestimonialController::class, 'destroy']);
        Route::patch('testimonials/{testimonial}/toggle', [TestimonialController::class, 'toggle']);

        // Announcements (Content & Announcement)
        Route::get('announcements', [\App\Http\Controllers\Api\AnnouncementController::class, 'index']);
        Route::post('announcements', [\App\Http\Controllers\Api\AnnouncementController::class, 'store']);
        Route::put('announcements/{announcement}', [\App\Http\Controllers\Api\AnnouncementController::class, 'update']);
        Route::delete('announcements/{announcement}', [\App\Http\Controllers\Api\AnnouncementController::class, 'destroy']);
        Route::patch('announcements/{announcement}/toggle-publish', [\App\Http\Controllers\Api\AnnouncementController::class, 'togglePublish']);
    });
});

// ─── KULINER PUBLIC ROUTES (NO AUTH REQUIRED) ───────────────────────────────
Route::prefix('kuliner/public')->group(function () {
    Route::get('settings', [\App\Http\Controllers\Api\KulinerController::class, 'getSettings']);
    Route::get('best-sellers', [\App\Http\Controllers\Api\KulinerController::class, 'getBestSellers']);
    Route::get('categories', [\App\Http\Controllers\Api\KulinerController::class, 'getPublicCategories']);
    Route::get('products', [\App\Http\Controllers\Api\KulinerController::class, 'getPublicProducts']);
    Route::post('validate-promo', [\App\Http\Controllers\Api\KulinerController::class, 'validatePromo']);
    Route::post('orders', [\App\Http\Controllers\Api\KulinerController::class, 'placeOrder']);
    Route::get('testimonials', [\App\Http\Controllers\Api\KulinerController::class, 'getPublicTestimonials']);
    Route::post('testimonials', [\App\Http\Controllers\Api\KulinerController::class, 'submitTestimonial']);
});
