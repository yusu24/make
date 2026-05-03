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
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                    => 'required|string|max:255',
            'email'                   => 'required|email|unique:users,email',
            'password'                => 'required|string|min:8|confirmed',
            'business_category_id'    => 'nullable|exists:business_categories,id',
            'phone'                   => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'role'                 => 'customer',
            'status'               => 'active',
            'business_category_id' => $request->business_category_id,
            'phone'                => $request->phone,
        ]);

        // Auto-create tenant if category provided
        if ($request->business_category_id) {
            $tenantId = 'TN-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);
            
            // Assign tenant_id to the created user
            $user->update(['tenant_id' => $tenantId]);

            $category = BusinessCategory::find($request->business_category_id);
            Tenant::create([
                'tenant_id'            => $tenantId,
                'user_id'              => $user->id,
                'business_category_id' => $request->business_category_id,
                'business_name'        => $user->name,
                'subscription_plan'    => 'free',
                'status'               => 'active',
                'trial_ends_at'        => now()->addDays(3),
            ]);
            // Auto-seed default data for Retail
            if ($category && $category->slug === 'toko-retail') {
                $this->seedDefaultRetailData($tenantId);
            }
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action'  => 'register',
            'target'  => 'User: ' . $user->name,
            'level'   => 'success',
            'ip_address' => $request->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data'    => [
                'token' => $token,
                'user'  => $this->formatUser($user),
            ],
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Data tidak lengkap', 'errors' => $validator->errors()], 422);
        }

        $user = User::with(['businessCategory', 'tenant', 'retailRole'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email atau password salah'], 401);
        }

        if ($user->status === 'inactive') {
            return response()->json(['success' => false, 'message' => 'Akun Anda tidak aktif. Hubungi admin.'], 403);
        }

        // Revoke old tokens & create new
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLog::create([
            'user_id'    => $user->id,
            'action'     => 'login',
            'target'     => 'System',
            'level'      => 'info',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data'    => [
                'token' => $token,
                'user'  => $this->formatUser($user),
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logout berhasil']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('businessCategory', 'tenant', 'retailRole');
        return response()->json(['success' => true, 'data' => $this->formatUser($user)]);
    }

    private function formatUser(User $user): array
    {
        $tenant = $user->tenant;
        $plan = $tenant?->subscription_plan ?? 'free';
        
        $status = 'active';
        $daysLeft = 0;

        if ($plan === 'free' && $tenant) {
            $createdAt = $tenant->created_at;
            $diffInDays = $createdAt->diffInDays(now(), false); // Days since registration

            if ($diffInDays >= 5) {
                $status = 'locked';
            } elseif ($diffInDays >= 3) {
                $status = 'warning';
                $daysLeft = 5 - $diffInDays;
            }
        }

        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'role'              => $user->role,
            'tenant_id'         => $user->tenant_id,
            'tenant_name'       => $tenant?->business_name ?? $tenant?->name,
            'status'            => $user->status,
            'phone'             => $user->phone,
            'business_category' => $user->businessCategory?->name,
            'business_category_id' => $user->business_category_id,
            'subscription_plan' => $plan,
            'subscription_status' => $status,
            'subscription_days_left' => $daysLeft,
            'active_modules'    => $tenant ? $tenant->modules()->where('is_active', true)->pluck('name')->toArray() : [],
            'permissions'       => ($user->role === 'customer' || $user->role === 'super_admin') 
                                    ? 'all' 
                                    : ($user->retailRole ? $user->retailRole->permissions : []),
        ];
    }

    private function seedDefaultRetailData(string $tenantId)
    {
        // 1. Categories
        $cats = ['Makanan', 'Minuman', 'Elektronik', 'Pakaian', 'Alat Kantor', 'Lainnya'];
        foreach ($cats as $c) {
            \App\Models\RetailCategory::create(['tenant_id' => $tenantId, 'name' => $c]);
        }

        // 2. Units
        $units = ['Pcs', 'Box', 'Pak', 'Botol', 'Kg', 'Liter', 'Meter'];
        foreach ($units as $u) {
            \App\Models\RetailUnit::create(['tenant_id' => $tenantId, 'name' => $u]);
        }

        // 3. Expense Categories
        $expCats = ['Gaji Pegawai', 'Sewa Tempat', 'Listrik & Air', 'Operasional', 'Pemasaran', 'Lain-lain'];
        foreach ($expCats as $ec) {
            \App\Models\RetailExpenseCategory::create(['tenant_id' => $tenantId, 'name' => $ec]);
        }
    }
}
