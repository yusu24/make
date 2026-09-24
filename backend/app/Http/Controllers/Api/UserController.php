<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['businessCategory', 'saasRole', 'tenant'])->latest();

        if ($request->search) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('name', 'like', "%$q%")
                   ->orWhere('email', 'like', "%$q%")
                   ->orWhere('tenant_id', 'like', "%$q%")
                   ->orWhereHas('tenant', fn($qt) => $qt->where('business_name', 'like', "%$q%"));
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            if (is_array($request->role)) {
                $query->whereIn('role', $request->role);
            } else {
                $query->where('role', $request->role);
            }
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('business_category_id')) {
            $query->where('business_category_id', $request->business_category_id);
        }

        $users = $query->paginate($request->per_page ?? 25);

        $data = collect($users->items())->map(fn ($u) => [
            'id'                   => $u->id,
            'name'                 => $u->name,
            'email'                => $u->email,
            'phone'                => $u->phone,
            'role'                 => $u->role,
            'status'               => $u->status,
            'business_category_id' => $u->business_category_id,
            'category'             => $u->businessCategory?->name ?? ($u->tenant?->businessCategory?->name ?? '-'),
            'tenant_id'            => $u->tenant_id ?? ($u->tenant?->tenant_id ?? null),
            'tenant_name'          => $u->tenant?->business_name ?? null,
            'plan'                 => $u->tenant?->subscription_plan ?? '-',
            'joined'               => $u->created_at->format('Y-m-d'),
            'saas_role_id'         => $u->saas_role_id,
            'saas_role'            => $u->saasRole?->name ?? ($u->role === 'super_admin' ? 'Super Admin' : ($u->role === 'admin' ? 'Admin' : '-')),
            'permissions'          => $u->role === 'super_admin' ? ['*'] : ($u->saasRole?->permissions ?? []),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'total'        => $users->total(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load('businessCategory', 'tenant', 'saasRole');
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                 => 'required|string|max:255',
            'email'                => 'required|email|unique:users,email',
            'password'             => 'required|string|min:8',
            'role'                 => 'nullable|string',
            'business_category_id' => 'nullable|exists:business_categories,id',
            'saas_role_id'         => 'nullable|exists:saas_roles,id',
            'phone'                => 'nullable|string|max:20',
            'plan'                 => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $role = $request->role ?? 'customer';

        $user = User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'role'                 => $role,
            'status'               => 'active',
            'email_verified_at'    => now(),
            'business_category_id' => $request->business_category_id,
            'saas_role_id'         => $request->saas_role_id,
            'phone'                => $request->phone,
        ]);

        // If user is a customer/tenant owner, automatically link and create the Tenant record!
        if ($role === 'customer' || $request->create_tenant) {
            $tenantId = 'TN-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);
            $user->update(['tenant_id' => $tenantId]);

            Tenant::create([
                'user_id'              => $user->id,
                'tenant_id'            => $tenantId,
                'business_name'        => $request->business_name ?: $user->name,
                'business_category_id' => $request->business_category_id,
                'subscription_plan'    => $request->plan ?? 'free',
                'status'               => 'active',
                'trial_ends_at'        => now()->addDays(3),
            ]);
        }

        ActivityLog::record('create_user', 'User: ' . $user->name . ' (' . $user->role . ')', 'success');

        return response()->json([
            'success' => true,
            'message' => 'Pengguna dan Tenant berhasil dibuat',
            'data'    => $user->load('tenant', 'businessCategory')
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name'                 => 'required|string|max:255',
            'email'                => 'required|email|unique:users,email,' . $user->id,
            'role'                 => 'nullable|string',
            'status'               => 'nullable|in:active,inactive,pending',
            'business_category_id' => 'nullable|exists:business_categories,id',
            'phone'                => 'nullable|string|max:20',
            'password'             => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only('name', 'email', 'role', 'status', 'business_category_id', 'phone', 'saas_role_id');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        $user->update($data);

        // Sync with Tenant if exists
        if ($user->tenant) {
            $tenantData = [];
            if ($request->filled('business_name') || $request->filled('name')) {
                $tenantData['business_name'] = $request->business_name ?? $request->name;
            }
            if ($request->filled('status')) {
                $tenantData['status'] = $request->status;
            }
            if ($request->filled('business_category_id')) {
                $tenantData['business_category_id'] = $request->business_category_id;
            }
            if ($request->filled('plan')) {
                $tenantData['subscription_plan'] = strtolower($request->plan);
            }
            if (!empty($tenantData)) {
                $user->tenant->update($tenantData);
            }
        } elseif ($user->role === 'customer') {
            // Auto-heal / create missing tenant if none exists
            $tenantId = 'TN-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);
            $user->update(['tenant_id' => $tenantId]);
            Tenant::create([
                'user_id'              => $user->id,
                'tenant_id'            => $tenantId,
                'business_name'        => $user->name,
                'business_category_id' => $user->business_category_id,
                'subscription_plan'    => 'free',
                'status'               => $user->status,
                'trial_ends_at'        => now()->addDays(3),
            ]);
        }

        ActivityLog::record('edit_user', 'User: ' . $user->name, 'info');
        return response()->json(['success' => true, 'message' => 'Pengguna dan Tenant terkait berhasil diperbarui', 'data' => $user->load('tenant', 'businessCategory')]);
    }

    public function destroy(User $user)
    {
        if ($user->role === 'super_admin') {
            return response()->json(['success' => false, 'message' => 'Super Admin tidak dapat dihapus'], 403);
        }

        ActivityLog::record('delete_user', 'User: ' . $user->name, 'danger');
        
        // If customer has a tenant, delete associated tenant
        if ($user->tenant) {
            $user->tenant->delete();
        }
        
        $user->delete();
        return response()->json(['success' => true, 'message' => 'Pengguna dan Tenant berhasil dihapus']);
    }

    public function updateStatus(Request $request, User $user)
    {
        $user->update(['status' => $request->status]);
        if ($user->tenant) {
            $user->tenant->update(['status' => $request->status]);
        }
        ActivityLog::record('toggle_user_status', 'User: ' . $user->name . ' -> ' . $request->status, 'info');
        return response()->json(['success' => true, 'message' => 'Status pengguna dan tenant berhasil diperbarui']);
    }
}