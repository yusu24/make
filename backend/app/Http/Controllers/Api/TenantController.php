<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::with('user', 'businessCategory')->latest();

        if ($request->search) {
            $q = $request->search;
            $query->whereHas('user', fn ($q2) => $q2->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"));
        }

        if ($request->status) $query->where('status', $request->status);
        if ($request->plan)   $query->where('subscription_plan', $request->plan);

        $tenants = $query->paginate($request->per_page ?? 20);

        $data = collect($tenants->items())->map(fn ($t) => [
            'id'          => $t->id,
            'tenant_id'   => $t->tenant_id,
            'name'        => $t->user?->name,
            'email'       => $t->user?->email,
            'category'    => $t->businessCategory?->name,
            'plan'        => $t->subscription_plan,
            'status'      => $t->status,
            'joined'      => $t->created_at->format('Y-m-d'),
        ]);

        return response()->json(['success' => true, 'data' => $data, 'meta' => [
            'total'        => $tenants->total(),
            'current_page' => $tenants->currentPage(),
            'last_page'    => $tenants->lastPage(),
        ]]);
    }

    public function show(Tenant $tenant)
    {
        $tenant->load('user', 'businessCategory');
        return response()->json(['success' => true, 'data' => $tenant]);
    }

    public function store(Request $request)
    {
        // Find business category ID based on name
        $category = \App\Models\BusinessCategory::where('name', $request->category)->first();
        
        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt('password123'),
            'role' => 'admin', // Tenant owner is an admin of their own store
            'tenant_id' => $request->tenant_id,
            'business_category_id' => $category ? $category->id : null,
        ]);

        $tenant = Tenant::create([
            'user_id' => $user->id,
            'tenant_id' => $request->tenant_id,
            'business_category_id' => $category ? $category->id : null,
            'subscription_plan' => $request->plan ?? 'free',
            'status' => 'active',
        ]);

        return response()->json(['success' => true, 'message' => 'Tenant berhasil dibuat']);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $tenant->update($request->only('status', 'subscription_plan', 'business_name'));
        ActivityLog::record('edit_tenant', 'Tenant: ' . $tenant->tenant_id, 'info');
        return response()->json(['success' => true, 'message' => 'Tenant diperbarui']);
    }

    public function destroy(Tenant $tenant)
    {
        ActivityLog::record('delete_tenant', 'Tenant: ' . $tenant->tenant_id, 'danger');
        $tenant->delete();
        return response()->json(['success' => true, 'message' => 'Tenant dihapus']);
    }

    public function getModules(string $tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $allModules = \App\Models\Module::all();
        $activeModules = $tenant->modules()->where('is_active', true)->pluck('modules.id')->toArray();

        $data = $allModules->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'is_active' => in_array($m->id, $activeModules)
        ]);

        return response()->json(['data' => $data]);
    }

    public function updateModules(Request $request, string $tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $moduleIds = $request->module_ids; // Array of IDs

        // Reset all
        $tenant->modules()->update(['is_active' => false]);

        // Set active
        if (!empty($moduleIds)) {
            foreach ($moduleIds as $mid) {
                // Ensure record exists in pivot first (seeders should have handled this, but just in case)
                $exists = $tenant->modules()->where('modules.id', $mid)->exists();
                if (!$exists) {
                    $tenant->modules()->attach($mid, ['is_active' => true]);
                } else {
                    $tenant->modules()->updateExistingPivot($mid, ['is_active' => true]);
                }
            }
        }

        return response()->json(['message' => 'Modul diperbarui']);
    }

    public function updatePlan(Request $request, string $tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $tenant->update(['subscription_plan' => $request->plan]);
        return response()->json(['message' => 'Paket berhasil diperbarui']);
    }
}
