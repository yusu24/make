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

    // Admin function to change tenant plan quickly (Development/Demo utility)
    Route::put('/admin/tenants/{tenant_id}/plan', function (Request $req, $tenant_id) {
        if ($req->user()->role !== 'super_admin' && $req->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $tenant->update(['subscription_plan' => $req->plan]);
        return response()->json(['message' => 'Plan updated', 'tenant' => $tenant]);
    });

    // Profile
    Route::put('profile',          [ProfileController::class, 'update']);
    Route::get('logs', [ActivityLogController::class, 'index']);

    // Subscription Requests
    Route::post('subscription/request', [\App\Http\Controllers\Api\SubscriptionRequestController::class, 'store']);
    Route::get('subscription/current',  [\App\Http\Controllers\Api\SubscriptionRequestController::class, 'current']);

    // Notifications
    Route::get('notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'readAll']);

    // Admin Specific
    Route::prefix('admin')->group(function () {
        Route::get('tenants', [TenantController::class, 'index']);
        Route::put('tenants/{tenant_id}/plan', [TenantController::class, 'updatePlan']);
        
        // Admin Subscription Controls
        Route::get('subscription/requests', [\App\Http\Controllers\Api\SubscriptionRequestController::class, 'index']);
        Route::post('subscription/requests/{id}/approve', [\App\Http\Controllers\Api\SubscriptionRequestController::class, 'approve']);
        Route::post('subscription/requests/{id}/reject',  [\App\Http\Controllers\Api\SubscriptionRequestController::class, 'reject']);
        
        Route::get('stats',        [DashboardController::class, 'stats']);
    });

    // Retail Endpoints
    Route::prefix('retail')->group(function () {
        // Roles & Staff
        Route::get('roles',        [RetailRoleController::class, 'index']);
        Route::post('roles',       [RetailRoleController::class, 'store']);
        Route::put('roles/{id}',   [RetailRoleController::class, 'update']);
        Route::delete('roles/{id}',[RetailRoleController::class, 'destroy']);

        Route::get('staff',        [RetailStaffController::class, 'index']);
        Route::post('staff',       [RetailStaffController::class, 'store']);
        Route::put('staff/{id}',   [RetailStaffController::class, 'update']);
        Route::delete('staff/{id}',[RetailStaffController::class, 'destroy']);
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

    // ─── BUDIDAYA (AQUACULTURE) ENDPOINTS ───────────────────────────────────
    Route::prefix('budidaya')->group(function () {
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\Budidaya\ReportController::class, 'dashboardStats']);

        // Ponds
        Route::apiResource('ponds', \App\Http\Controllers\Api\Budidaya\PondController::class);

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
    });


    // ─── ADMIN ONLY ────────────────────────────────────────────────────────
    Route::middleware('is_admin')->group(function () {

        // Users
        Route::get('users',               [UserController::class, 'index']);
        Route::post('users',              [UserController::class, 'store']);
        Route::get('users/{user}',        [UserController::class, 'show']);
        Route::put('users/{user}',        [UserController::class, 'update']);
        Route::delete('users/{user}',     [UserController::class, 'destroy']);
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);

        // Tenants
        Route::get('tenants',               [TenantController::class, 'index']);
        Route::get('tenants/{tenant}',      [TenantController::class, 'show']);
        Route::put('tenants/{tenant}',      [TenantController::class, 'update']);
        Route::delete('tenants/{tenant}',   [TenantController::class, 'destroy']);

        // Categories (admin manages)
        Route::get('categories',                            [BusinessCategoryController::class, 'index']);
        Route::post('categories',                           [BusinessCategoryController::class, 'store']);
        Route::put('categories/{businessCategory}',         [BusinessCategoryController::class, 'update']);
        Route::delete('categories/{businessCategory}',      [BusinessCategoryController::class, 'destroy']);
        Route::patch('categories/{businessCategory}/toggle',[BusinessCategoryController::class, 'toggle']);

        // Activity Logs
        Route::get('logs', [ActivityLogController::class, 'index']);

        // Admin FULL ACCESS → Retail master data per tenant (developer view)
        Route::prefix('retail-admin')->group(function () {
            // Categories
            Route::get('categories',         [RetailMasterController::class, 'adminGetCategories']);
            Route::post('categories',        [RetailMasterController::class, 'adminStoreCategory']);
            Route::put('categories/{id}',    [RetailMasterController::class, 'adminUpdateCategory']);
            Route::delete('categories/{id}', [RetailMasterController::class, 'adminDestroyCategory']);
            // Units
            Route::get('units',              [RetailMasterController::class, 'adminGetUnits']);
            Route::post('units',             [RetailMasterController::class, 'adminStoreUnit']);
            Route::put('units/{id}',         [RetailMasterController::class, 'adminUpdateUnit']);
            Route::delete('units/{id}',      [RetailMasterController::class, 'adminDestroyUnit']);
            // Expense Categories
            Route::get('expense-categories',         [RetailMasterController::class, 'adminGetExpenseCategories']);
            Route::post('expense-categories',        [RetailMasterController::class, 'adminStoreExpenseCategory']);
            Route::put('expense-categories/{id}',    [RetailMasterController::class, 'adminUpdateExpenseCategory']);
            Route::delete('expense-categories/{id}', [RetailMasterController::class, 'adminDestroyExpenseCategory']);
        });

        // Admin management (super_admin only)
        Route::middleware('is_super_admin')->group(function () {
            Route::post('admins',        [UserController::class, 'store']);
            Route::delete('admins/{user}', [UserController::class, 'destroy']);
        });
    });
});
