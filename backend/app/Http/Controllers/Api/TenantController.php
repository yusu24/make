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
}
