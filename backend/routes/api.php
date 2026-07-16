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
use App\Http\Controllers\Api\SubscriptionRequestController;
use App\Http\Controllers\Api\LandingSettingController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\AdminFinanceController;
use App\Http\Controllers\Api\AdminAnalyticsController;

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::post('demo-sandbox', [AuthController::class, 'createDemoSandbox']);
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

    // Notifications
    Route::get('notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'readAll']);

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
        Route::prefix('retail')->middleware('check_category:toko-retail')->group(function () {

            // Master data (categories, suppliers, customers, units, expense categories, settings)
            Route::middleware('retail_permission:master')->group(function () {
                Route::get('categories', [RetailMasterController::class, 'getCategories']);
                Route::post('categories', [RetailMasterController::class, 'storeCategory']);
                Route::put('categories/{id}', [RetailMasterController::class, 'updateCategory']);
                Route::delete('categories/{id}', [RetailMasterController::class, 'destroyCategory']);

                Route::get('suppliers', [RetailMasterController::class, 'getSuppliers']);
                Route::post('suppliers', [RetailMasterController::class, 'storeSupplier']);
                Route::put('suppliers/{id}', [RetailMasterController::class, 'updateSupplier']);
                Route::delete('suppliers/{id}', [RetailMasterController::class, 'destroySupplier']);

                Route::get('customers', [RetailMasterController::class, 'getCustomers']);
                Route::post('customers', [RetailMasterController::class, 'storeCustomer']);
                Route::put('customers/{id}', [RetailMasterController::class, 'updateCustomer']);
                Route::delete('customers/{id}', [RetailMasterController::class, 'destroyCustomer']);

                Route::get('units', [RetailMasterController::class, 'getUnits']);
                Route::post('units', [RetailMasterController::class, 'storeUnit']);
                Route::put('units/{id}', [RetailMasterController::class, 'updateUnit']);
                Route::delete('units/{id}', [RetailMasterController::class, 'destroyUnit']);

                Route::get('expense-categories', [RetailMasterController::class, 'getExpenseCategories']);
                Route::post('expense-categories', [RetailMasterController::class, 'storeExpenseCategory']);
                Route::put('expense-categories/{id}', [RetailMasterController::class, 'updateExpenseCategory']);
                Route::delete('expense-categories/{id}', [RetailMasterController::class, 'destroyExpenseCategory']);

                Route::get('settings', [RetailMasterController::class, 'getSettings']);
                Route::put('settings', [RetailMasterController::class, 'updateSettings']);
                Route::post('settings/qris', [RetailMasterController::class, 'uploadQris']);
                Route::delete('settings/qris', [RetailMasterController::class, 'deleteQris']);
            });

            // Roles
            Route::middleware('retail_permission:roles')->group(function () {
                Route::get('roles', [RetailRoleController::class, 'index']);
                Route::post('roles', [RetailRoleController::class, 'store']);
                Route::put('roles/{id}', [RetailRoleController::class, 'update']);
                Route::delete('roles/{id}', [RetailRoleController::class, 'destroy']);
            });

            // Staff
            Route::middleware('retail_permission:staff')->group(function () {
                Route::get('staff', [RetailStaffController::class, 'index']);
                Route::post('staff', [RetailStaffController::class, 'store']);
                Route::put('staff/{id}', [RetailStaffController::class, 'update']);
                Route::delete('staff/{id}', [RetailStaffController::class, 'destroy']);
            });

            // Products (catalog)
            Route::middleware('retail_permission:catalog')->group(function () {
                Route::get('products', [RetailProductController::class, 'index']);
                Route::post('products', [RetailProductController::class, 'store']);
                Route::put('products/{id}', [RetailProductController::class, 'update']);
                Route::delete('products/{id}', [RetailProductController::class, 'destroy']);
            });

            // Stock & audit trail (inventory)
            Route::middleware('retail_permission:inventory')->group(function () {
                Route::get('stock', [\App\Http\Controllers\Api\Retail\RetailStockController::class, 'index']);
                Route::get('stock/movements', [\App\Http\Controllers\Api\Retail\RetailStockController::class, 'movements']);

                Route::get('stock-opnames', [\App\Http\Controllers\Api\Retail\RetailStockOpnameController::class, 'index']);
                Route::get('stock-opnames/{id}', [\App\Http\Controllers\Api\Retail\RetailStockOpnameController::class, 'show']);
                Route::post('stock-opnames', [\App\Http\Controllers\Api\Retail\RetailStockOpnameController::class, 'store']);
                Route::put('stock-opnames/{id}', [\App\Http\Controllers\Api\Retail\RetailStockOpnameController::class, 'update']);
                Route::post('stock-opnames/{id}/finalize', [\App\Http\Controllers\Api\Retail\RetailStockOpnameController::class, 'finalize']);
                Route::delete('stock-opnames/{id}', [\App\Http\Controllers\Api\Retail\RetailStockOpnameController::class, 'destroy']);
            });

            // Transactions / POS (checkout, void, discount validation)
            Route::middleware('retail_permission:pos')->group(function () {
                Route::get('transactions', [RetailTransactionController::class, 'index']);
                Route::get('transactions/{id}', [RetailTransactionController::class, 'show']);
                Route::post('transactions', [RetailTransactionController::class, 'store']);
                Route::post('transactions/{id}/void', [RetailTransactionController::class, 'void']);

                Route::post('discount/validate', [\App\Http\Controllers\Api\Retail\RetailDiscountController::class, 'validateCode']);

                Route::get('customer-returns', [\App\Http\Controllers\Api\Retail\RetailCustomerReturnController::class, 'index']);
                Route::get('customer-returns/order/{transaction}', [\App\Http\Controllers\Api\Retail\RetailCustomerReturnController::class, 'orderDetails']);
                Route::post('customer-returns', [\App\Http\Controllers\Api\Retail\RetailCustomerReturnController::class, 'store']);
                Route::post('customer-returns/{id}/confirm', [\App\Http\Controllers\Api\Retail\RetailCustomerReturnController::class, 'confirm']);
                Route::delete('customer-returns/{id}', [\App\Http\Controllers\Api\Retail\RetailCustomerReturnController::class, 'destroy']);
            });

            // Discounts & pricelists
            Route::middleware('retail_permission:discounts')->group(function () {
                Route::get('discounts', [\App\Http\Controllers\Api\Retail\RetailDiscountController::class, 'index']);
                Route::post('discounts', [\App\Http\Controllers\Api\Retail\RetailDiscountController::class, 'store']);
                Route::put('discounts/{id}', [\App\Http\Controllers\Api\Retail\RetailDiscountController::class, 'update']);
                Route::delete('discounts/{id}', [\App\Http\Controllers\Api\Retail\RetailDiscountController::class, 'destroy']);

                Route::get('pricelists', [\App\Http\Controllers\Api\Retail\RetailPricelistController::class, 'index']);
                Route::post('pricelists', [\App\Http\Controllers\Api\Retail\RetailPricelistController::class, 'store']);
                Route::put('pricelists/{id}', [\App\Http\Controllers\Api\Retail\RetailPricelistController::class, 'update']);
                Route::delete('pricelists/{id}', [\App\Http\Controllers\Api\Retail\RetailPricelistController::class, 'destroy']);
            });

            // Purchasing & supplier returns
            Route::middleware('retail_permission:purchasing')->group(function () {
                Route::get('purchases', [RetailPurchaseController::class, 'index']);
                Route::post('purchases', [RetailPurchaseController::class, 'store']);

                Route::get('supplier-returns', [\App\Http\Controllers\Api\Retail\RetailSupplierReturnController::class, 'index']);
                Route::post('supplier-returns', [\App\Http\Controllers\Api\Retail\RetailSupplierReturnController::class, 'store']);
                Route::post('supplier-returns/{id}/confirm', [\App\Http\Controllers\Api\Retail\RetailSupplierReturnController::class, 'confirm']);
                Route::delete('supplier-returns/{id}', [\App\Http\Controllers\Api\Retail\RetailSupplierReturnController::class, 'destroy']);
            });

            // Finance (expenses, payables, receivables, cash summary)
            Route::middleware('retail_permission:finance')->group(function () {
                Route::get('finance/summary', [\App\Http\Controllers\Api\RetailFinanceController::class, 'getSummary']);
                Route::get('finance/cash-summary', [\App\Http\Controllers\Api\RetailFinanceController::class, 'getCashSummary']);
                Route::get('finance/expenses', [\App\Http\Controllers\Api\RetailFinanceController::class, 'index']);
                Route::post('finance/expenses', [\App\Http\Controllers\Api\RetailFinanceController::class, 'store']);
                Route::put('finance/expenses/{id}', [\App\Http\Controllers\Api\RetailFinanceController::class, 'update']);
                Route::delete('finance/expenses/{id}', [\App\Http\Controllers\Api\RetailFinanceController::class, 'destroy']);

                Route::get('payables', [\App\Http\Controllers\Api\Retail\RetailPayableController::class, 'index']);
                Route::post('payables', [\App\Http\Controllers\Api\Retail\RetailPayableController::class, 'store']);
                Route::post('payables/{id}/payments', [\App\Http\Controllers\Api\Retail\RetailPayableController::class, 'recordPayment']);
                Route::delete('payables/{id}', [\App\Http\Controllers\Api\Retail\RetailPayableController::class, 'destroy']);

                Route::get('receivables', [\App\Http\Controllers\Api\Retail\RetailReceivableController::class, 'index']);
                Route::post('receivables', [\App\Http\Controllers\Api\Retail\RetailReceivableController::class, 'store']);
                Route::post('receivables/{id}/payments', [\App\Http\Controllers\Api\Retail\RetailReceivableController::class, 'recordPayment']);
                Route::delete('receivables/{id}', [\App\Http\Controllers\Api\Retail\RetailReceivableController::class, 'destroy']);
            });

            // Reports
            Route::middleware('retail_permission:reports')->group(function () {
                Route::get('reports', [RetailReportController::class, 'getReports']);
                Route::get('reports/profit-loss', [RetailReportController::class, 'profitLoss']);
                Route::get('reports/purchases', [RetailReportController::class, 'purchases']);
                Route::get('reports/returns', [RetailReportController::class, 'returns']);
            });
        });

        Route::middleware('check_category:toko-retail')->group(function () {
            // Dashboard
            Route::get('dashboard', [DashboardController::class, 'index']);
        });

        // ─── BUDIDAYA (AQUACULTURE) ENDPOINTS ───────────────────────────────────
        Route::prefix('budidaya')->middleware('check_category:budidaya-ikan')->group(function () {
            Route::get('dashboard/stats', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'dashboardStats']);
            Route::get('reports/ponds', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'pondReport']);
            Route::get('reports/harvest', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'harvestSummary']);

            // Ponds
            Route::apiResource('ponds', \App\Http\Controllers\Api\Budidaya\PondController::class);
            Route::get('ponds/{id}/cycle', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'show']);
            Route::post('ponds/{id}/cycles/start', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'start']);

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

            // Inventory (Gudang)
            Route::get('inventory', [\App\Http\Controllers\Api\Budidaya\InventoryController::class, 'index']);
            Route::post('inventory', [\App\Http\Controllers\Api\Budidaya\InventoryController::class, 'store']);
            Route::put('inventory/{id}', [\App\Http\Controllers\Api\Budidaya\InventoryController::class, 'update']);
            Route::delete('inventory/{id}', [\App\Http\Controllers\Api\Budidaya\InventoryController::class, 'destroy']);
            Route::post('inventory/{id}/stock', [\App\Http\Controllers\Api\Budidaya\InventoryController::class, 'updateStock']);
            Route::get('inventory/{id}/logs', [\App\Http\Controllers\Api\Budidaya\InventoryController::class, 'logs']);

            // Cycles
            Route::get('cycles', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'index']);
            Route::get('cycles/{id}', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'details']);
            Route::post('cycles', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'store']);
            Route::post('cycles/{id}/harvest', [\App\Http\Controllers\Api\Budidaya\HarvestController::class, 'store']);
            Route::post('cycles/{id}/move', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'movePond']);
            Route::post('cycles/{id}/feedings', [\App\Http\Controllers\Api\Budidaya\FeedingController::class, 'store']);
            Route::post('cycles/{id}/health', [\App\Http\Controllers\Api\Budidaya\HealthController::class, 'store']);
            
            // Cycle Logs
            Route::put('feedings/{id}', [\App\Http\Controllers\Api\Budidaya\FeedingController::class, 'update']);
            Route::delete('feedings/{id}', [\App\Http\Controllers\Api\Budidaya\FeedingController::class, 'destroy']);
            
            Route::post('health', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'logHealth']);
            Route::put('health/{id}', [\App\Http\Controllers\Api\Budidaya\HealthController::class, 'update']);
            Route::delete('health/{id}', [\App\Http\Controllers\Api\Budidaya\HealthController::class, 'destroy']);
            
            Route::post('samplings', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'logSampling']);
            Route::put('samplings/{id}', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'updateSampling']);
            Route::delete('samplings/{id}', [\App\Http\Controllers\Api\Budidaya\CycleController::class, 'deleteSampling']);

            Route::put('harvests/{id}', [\App\Http\Controllers\Api\Budidaya\HarvestController::class, 'update']);
            Route::delete('harvests/{id}', [\App\Http\Controllers\Api\Budidaya\HarvestController::class, 'destroy']);

            // Finance
            Route::apiResource('expenses', \App\Http\Controllers\Api\Budidaya\FinanceController::class)->except(['show']);
            
            // Legacy / Helper endpoints
            Route::post('cycles/start', [\App\Http\Controllers\Api\Budidaya\BudidayaCycleController::class, 'start']);
            Route::post('pond', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storePond']);
            Route::post('cycle', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeCycle']);
            Route::post('expense', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeExpense']);
            Route::post('harvest', [\App\Http\Controllers\Api\CoreBudidayaController::class, 'storeHarvest']);
        });

        // Culinary Admin Routes (Accessible for all culinary tenants)
        Route::prefix('kuliner/admin')->middleware('check_category:kuliner')->group(function () {
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
            Route::post('ai-insights', [\App\Http\Controllers\Api\KulinerController::class, 'getAiInsights']);
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

            // ── Phase 1: Menu engineering (Bahan Baku, Recipe/BOM, Modifier, Add-on, Bundle) ──
            Route::middleware('kuliner_permission:ingredients')->group(function () {
                Route::get('ingredients-export', [\App\Http\Controllers\Api\Kuliner\IngredientController::class, 'exportExcel']);
                Route::post('ingredients-import', [\App\Http\Controllers\Api\Kuliner\IngredientController::class, 'importExcel']);
                Route::get('ingredients/{id}/movements', [\App\Http\Controllers\Api\Kuliner\IngredientController::class, 'movements']);
                Route::post('ingredients/{id}/adjust-stock', [\App\Http\Controllers\Api\Kuliner\IngredientController::class, 'adjustStock']);
                Route::apiResource('ingredients', \App\Http\Controllers\Api\Kuliner\IngredientController::class);
                Route::apiResource('suppliers', \App\Http\Controllers\Api\Kuliner\SupplierController::class)->except(['show']);
            });
            Route::middleware('kuliner_permission:recipes')->group(function () {
                Route::get('products/{product}/recipe', [\App\Http\Controllers\Api\Kuliner\RecipeController::class, 'index']);
                Route::put('products/{product}/recipe', [\App\Http\Controllers\Api\Kuliner\RecipeController::class, 'sync']);
            });
            Route::middleware('kuliner_permission:modifiers')->group(function () {
                Route::post('products/{product}/modifier-groups/{group}', [\App\Http\Controllers\Api\Kuliner\ModifierGroupController::class, 'attachToProduct']);
                Route::delete('products/{product}/modifier-groups/{group}', [\App\Http\Controllers\Api\Kuliner\ModifierGroupController::class, 'detachFromProduct']);
                Route::apiResource('modifier-groups', \App\Http\Controllers\Api\Kuliner\ModifierGroupController::class)->except(['show']);
            });
            Route::middleware('kuliner_permission:addons')->group(function () {
                Route::post('products/{product}/addons/{addon}', [\App\Http\Controllers\Api\Kuliner\AddonController::class, 'attachToProduct']);
                Route::delete('products/{product}/addons/{addon}', [\App\Http\Controllers\Api\Kuliner\AddonController::class, 'detachFromProduct']);
                Route::apiResource('addons', \App\Http\Controllers\Api\Kuliner\AddonController::class)->except(['show']);
            });
            Route::middleware('kuliner_permission:bundles')->group(function () {
                Route::apiResource('bundles', \App\Http\Controllers\Api\Kuliner\BundleController::class);
            });

            // ── Phase 2: Order lifecycle & kitchen operations ──
            Route::middleware('kuliner_permission:orders')->group(function () {
                Route::get('kitchen-queue', [\App\Http\Controllers\Api\Kuliner\KitchenQueueController::class, 'index']);
            });
            Route::middleware('kuliner_permission:shift')->group(function () {
                Route::get('shifts/current', [\App\Http\Controllers\Api\Kuliner\ShiftController::class, 'current']);
                Route::get('shifts/history', [\App\Http\Controllers\Api\Kuliner\ShiftController::class, 'history']);
                Route::post('shifts/open', [\App\Http\Controllers\Api\Kuliner\ShiftController::class, 'open']);
                Route::post('shifts/{id}/close', [\App\Http\Controllers\Api\Kuliner\ShiftController::class, 'close']);
            });

            // ── Phase 3: Stock opname & waste management ──
            Route::middleware('kuliner_permission:ingredients')->group(function () {
                Route::get('ingredient-opnames', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'index']);
                Route::post('ingredient-opnames', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'store']);
                Route::get('ingredient-opnames/{id}', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'show']);
                Route::put('ingredient-opnames/{id}', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'update']);
                Route::post('ingredient-opnames/{id}/submit', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'submit']);
                Route::post('ingredient-opnames/{id}/approve', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'approve']);
                Route::post('ingredient-opnames/{id}/reject', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'reject']);
                Route::delete('ingredient-opnames/{id}', [\App\Http\Controllers\Api\Kuliner\IngredientOpnameController::class, 'destroy']);

                Route::get('wastes', [\App\Http\Controllers\Api\Kuliner\WasteController::class, 'index']);
                Route::post('wastes', [\App\Http\Controllers\Api\Kuliner\WasteController::class, 'store']);
                Route::delete('wastes/{id}', [\App\Http\Controllers\Api\Kuliner\WasteController::class, 'destroy']);
            });

            // ── Phase 4: Reporting ──
            Route::middleware('kuliner_permission:reports')->group(function () {
                Route::get('reports/profit-loss', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'profitLoss']);
                Route::get('reports/menu-margin', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'menuMargin']);
                Route::get('reports/best-sellers', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'bestSellers']);
                Route::get('reports/worst-sellers', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'worstSellers']);
                Route::get('reports/sales-by-hour', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'salesByHour']);
                Route::get('reports/sales-by-day', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'salesByDay']);
                Route::get('reports/sales-by-month', [\App\Http\Controllers\Api\Kuliner\ReportController::class, 'salesByMonth']);
            });

            // ── Phase 5: Table management (dine-in mode) ──
            Route::middleware('kuliner_permission:orders')->group(function () {
                Route::get('tables', [\App\Http\Controllers\Api\Kuliner\TableController::class, 'index']);
                Route::post('tables', [\App\Http\Controllers\Api\Kuliner\TableController::class, 'store']);
                Route::put('tables/{id}', [\App\Http\Controllers\Api\Kuliner\TableController::class, 'update']);
                Route::patch('tables/{id}/status', [\App\Http\Controllers\Api\Kuliner\TableController::class, 'updateStatus']);
                Route::delete('tables/{id}', [\App\Http\Controllers\Api\Kuliner\TableController::class, 'destroy']);
            });
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
        Route::get('subscription-plans', [\App\Http\Controllers\Api\SubscriptionPlanController::class, 'index']);
        Route::put('subscription-plans/{id}', [\App\Http\Controllers\Api\SubscriptionPlanController::class, 'update']);
        Route::get('subscription/requests', [SubscriptionRequestController::class, 'index']);
        Route::post('subscription/requests/{id}/approve', [SubscriptionRequestController::class, 'approve']);
        Route::post('subscription/requests/{id}/reject', [SubscriptionRequestController::class, 'reject']);
        Route::post('landing-settings', [LandingSettingController::class, 'update']);
        Route::post('landing-settings/upload-logo', [LandingSettingController::class, 'uploadLogo']);
        Route::post('landing-settings/reset-logo', [LandingSettingController::class, 'resetLogo']);
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
