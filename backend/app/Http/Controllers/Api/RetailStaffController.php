<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RetailStaffController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $staff = User::with('retailRole')->where('tenant_id', $tenantId)->get();
        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Cek Kuota (1 for Free, 5 for Basic)
        $tenantData = Tenant::where('tenant_id', $tenantId)->first();
        $plan = $tenantData ? $tenantData->subscription_plan : 'free';
        
        $currentStaffCount = User::where('tenant_id', $tenantId)->where('id', '!=', $user->id)->count(); // Exclude owner
        
        if ($plan === 'free' && $currentStaffCount >= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Batas kuota pegawai paket FREE telah tercapai (Maks 1 orang). Silakan upgrade ke paket Basic atau Pro.',
                'code' => 'QUOTA_EXCEEDED'
            ], 403);
        }

        if ($plan === 'basic' && $currentStaffCount >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Batas kuota pegawai paket BASIC telah tercapai (Maks 5 orang). Silakan upgrade ke paket Pro.',
                'code' => 'QUOTA_EXCEEDED'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'retail_role_id' => 'required|integer|exists:retail_roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newStaff = User::create([
            'tenant_id'            => $tenantId,
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'role'                 => 'retail_cashier',
            'retail_role_id'       => $request->retail_role_id,
            'status'               => 'active',
            'business_category_id' => $user->business_category_id,
        ]);

        return response()->json(['message' => 'Pegawai berhasil ditambahkan', 'data' => $newStaff]);
    }

    public function update(Request $request, int $id)
    {
        $tenantId = $request->user()->tenant_id;
        $staff = User::where('id', $id)->where('tenant_id', $tenantId)->first();
        if (!$staff) return response()->json(['message' => 'Not found'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'retail_role_id' => 'required|integer|exists:retail_roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dataToUpdate = ['name' => $request->name, 'email' => $request->email, 'retail_role_id' => $request->retail_role_id];
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        $staff->update($dataToUpdate);
        return response()->json(['message' => 'Pegawai diupdate', 'data' => $staff]);
    }

    public function destroy(Request $request, int $id)
    {
        $tenantId = $request->user()->tenant_id;
        // Mencegah menghapus diri sendiri
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'Tidak dapat menghapus akun Anda sendiri'], 400);
        }

        $staff = User::where('id', $id)->where('tenant_id', $tenantId)->first();
        if (!$staff) return response()->json(['message' => 'Not found'], 404);

        $staff->delete();
        return response()->json(['message' => 'Pegawai dihapus']);
    }
}

