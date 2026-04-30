<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailCategory;
use App\Models\RetailSupplier;
use App\Models\RetailCustomer;
use App\Models\RetailUnit;

class RetailMasterController extends Controller
{
    public function getCategories(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(RetailCategory::where('tenant_id', $tenantId)->get());
    }

    public function storeCategory(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cat = RetailCategory::create(['tenant_id' => $tenantId, 'name' => $request->name]);
        return response()->json($cat);
    }
    
    public function updateCategory(Request $request, int $id) {
        $cat = RetailCategory::findOrFail($id);
        $cat->update(['name' => $request->name]);
        return response()->json($cat);
    }

    public function destroyCategory(int $id) {
        RetailCategory::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    public function getSuppliers(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(RetailSupplier::where('tenant_id', $tenantId)->latest()->get());
    }

    public function storeSupplier(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $sup = RetailSupplier::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'contact' => $request->contact,
            'address' => $request->address
        ]);
        return response()->json($sup);
    }

    public function updateSupplier(Request $request, int $id) {
        $sup = RetailSupplier::findOrFail($id);
        $sup->update([
            'name' => $request->name,
            'contact' => $request->contact,
            'address' => $request->address
        ]);
        return response()->json($sup);
    }

    public function destroySupplier(int $id) {
        RetailSupplier::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    public function getCustomers(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(RetailCustomer::where('tenant_id', $tenantId)->latest()->get());
    }

    public function storeCustomer(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cus = RetailCustomer::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'contact' => $request->contact,
            'email' => $request->email,
            'address' => $request->address
        ]);
        return response()->json($cus);
    }

    public function updateCustomer(Request $request, int $id) {
        $cus = RetailCustomer::findOrFail($id);
        $cus->update([
            'name' => $request->name,
            'contact' => $request->contact,
            'email' => $request->email,
            'address' => $request->address
        ]);
        return response()->json($cus);
    }

    public function destroyCustomer(int $id) {
        RetailCustomer::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // Units
    public function getUnits(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(RetailUnit::where('tenant_id', $tenantId)->get());
    }

    public function storeUnit(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $unit = RetailUnit::create(['tenant_id' => $tenantId, 'name' => $request->name]);
        return response()->json($unit);
    }

    public function updateUnit(Request $request, int $id) {
        $unit = RetailUnit::findOrFail($id);
        $unit->update(['name' => $request->name]);
        return response()->json($unit);
    }

    public function destroyUnit(int $id) {
        RetailUnit::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // Expense Categories
    public function getExpenseCategories(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        return response()->json(\App\Models\RetailExpenseCategory::where('tenant_id', $tenantId)->get());
    }

    public function storeExpenseCategory(Request $request) {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $cat = \App\Models\RetailExpenseCategory::create(['tenant_id' => $tenantId, 'name' => $request->name]);
        return response()->json($cat);
    }

    public function updateExpenseCategory(Request $request, int $id) {
        $cat = \App\Models\RetailExpenseCategory::findOrFail($id);
        $cat->update(['name' => $request->name]);
        return response()->json($cat);
    }

    public function destroyExpenseCategory(int $id) {
        \App\Models\RetailExpenseCategory::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FULL-ACCESS METHODS (reads tenant_id from query param)
    // ═══════════════════════════════════════════════════════════════════════

    private function adminTenantId(Request $request): string {
        return $request->query('tenant_id', 'TN-001');
    }

    // Categories (admin)
    public function adminGetCategories(Request $request) {
        return response()->json(RetailCategory::where('tenant_id', $this->adminTenantId($request))->get());
    }
    public function adminStoreCategory(Request $request) {
        $cat = RetailCategory::create(['tenant_id' => $this->adminTenantId($request), 'name' => $request->name]);
        return response()->json($cat);
    }
    public function adminUpdateCategory(Request $request, int $id) {
        $cat = RetailCategory::findOrFail($id);
        $cat->update(['name' => $request->name]);
        return response()->json($cat);
    }
    public function adminDestroyCategory(int $id) {
        RetailCategory::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // Units (admin)
    public function adminGetUnits(Request $request) {
        return response()->json(RetailUnit::where('tenant_id', $this->adminTenantId($request))->get());
    }
    public function adminStoreUnit(Request $request) {
        $unit = RetailUnit::create(['tenant_id' => $this->adminTenantId($request), 'name' => $request->name]);
        return response()->json($unit);
    }
    public function adminUpdateUnit(Request $request, int $id) {
        $unit = RetailUnit::findOrFail($id);
        $unit->update(['name' => $request->name]);
        return response()->json($unit);
    }
    public function adminDestroyUnit(int $id) {
        RetailUnit::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // Expense Categories (admin)
    public function adminGetExpenseCategories(Request $request) {
        return response()->json(\App\Models\RetailExpenseCategory::where('tenant_id', $this->adminTenantId($request))->get());
    }
    public function adminStoreExpenseCategory(Request $request) {
        $cat = \App\Models\RetailExpenseCategory::create(['tenant_id' => $this->adminTenantId($request), 'name' => $request->name]);
        return response()->json($cat);
    }
    public function adminUpdateExpenseCategory(Request $request, int $id) {
        $cat = \App\Models\RetailExpenseCategory::findOrFail($id);
        $cat->update(['name' => $request->name]);
        return response()->json($cat);
    }
    public function adminDestroyExpenseCategory(int $id) {
        \App\Models\RetailExpenseCategory::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}

