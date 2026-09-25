<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\JasaRole;
use App\Models\JasaTechnician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class JasaStaffController extends Controller
{
    private function resolveTenantId(Request $request): string
    {
        $tenantId = $request->attributes->get('tenant_id') ?? $request->user()?->tenant_id;
        if (empty($tenantId)) {
            abort(response()->json(['message' => 'Unauthorized: No Tenant ID associated with this request.'], 403));
        }
        return $tenantId;
    }

    public function index(Request $request)
    {
        $tenantId = $this->resolveTenantId($request);
        $staff = User::with(['jasaRole', 'technician'])
            ->where('tenant_id', $tenantId)
            ->get();

        return response()->json(['data' => $staff]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->resolveTenantId($request);
        $user = $request->user();

        // Quota check
        $tenantData = Tenant::where('tenant_id', $tenantId)->first();
        if ($tenantData) {
            $plan = \App\Models\SubscriptionPlan::forTenant($tenantData);
            $currentStaffCount = User::where('tenant_id', $tenantId)->where('id', '!=', $user->id)->count();

            if ($plan && $plan->max_staff !== null && $currentStaffCount >= $plan->max_staff) {
                return response()->json([
                    'success' => false,
                    'message' => "Batas kuota pegawai paket {$plan->name} telah tercapai (Maks {$plan->max_staff} orang). Silakan upgrade paket.",
                    'code' => 'QUOTA_EXCEEDED'
                ], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:6',
            'jasa_role_id' => 'nullable|integer',
            'phone'        => 'nullable|string|max:30',
            'link_technician_id' => 'nullable',
        ], [
            'name.required'     => 'Nama staf wajib diisi.',
            'email.required'    => 'Email login wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Email ini sudah terdaftar. Silakan gunakan alamat email lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal harus 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        // Resolve role ID safely
        $roleId = $request->jasa_role_id;
        if ($roleId) {
            $roleExists = JasaRole::where('id', $roleId)->exists();
            if (!$roleExists) {
                $firstRole = JasaRole::where('tenant_id', $tenantId)->first();
                $roleId = $firstRole ? $firstRole->id : null;
            }
        } else {
            $firstRole = JasaRole::where('tenant_id', $tenantId)->first();
            $roleId = $firstRole ? $firstRole->id : null;
        }

        $bizCatId = $user->business_category_id;
        if (!$bizCatId && $tenantData) {
            $bizCatId = $tenantData->business_category_id;
        }

        $newStaff = User::create([
            'tenant_id'            => $tenantId,
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'role'                 => 'jasa_staff',
            'jasa_role_id'         => $roleId,
            'phone'                => $request->phone,
            'status'               => 'active',
            'business_category_id' => $bizCatId,
        ]);

        if ($request->boolean('auto_create_technician')) {
            JasaTechnician::create([
                'tenant_id'      => $tenantId,
                'name'           => $request->name,
                'user_id'        => $newStaff->id,
                'specialty'      => $request->technician_specialty ?: 'Teknisi Umum',
                'phone'          => $request->phone,
                'email'          => $request->email,
                'current_status' => 'Tersedia',
                'is_active'      => true,
            ]);
        } elseif ($request->filled('link_technician_id')) {
            JasaTechnician::where('id', $request->link_technician_id)
                ->where('tenant_id', $tenantId)
                ->update(['user_id' => $newStaff->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Akun staf berhasil dibuat',
            'data'    => $newStaff->load(['jasaRole', 'technician'])
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $tenantId = $this->resolveTenantId($request);
        $staff = User::where('id', $id)->where('tenant_id', $tenantId)->first();

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staf tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'email'        => "required|email|unique:users,email,{$id}",
            'password'     => 'nullable|string|min:6',
            'jasa_role_id' => 'nullable|integer',
            'phone'        => 'nullable|string|max:30',
            'status'       => 'nullable|in:active,inactive',
            'link_technician_id' => 'nullable',
        ], [
            'name.required' => 'Nama staf wajib diisi.',
            'email.required' => 'Email login wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan alamat email lain.',
            'password.min' => 'Password minimal harus 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $updateData = [
            'name'         => $request->name,
            'email'        => $request->email,
            'jasa_role_id' => $request->jasa_role_id ?: $staff->jasa_role_id,
            'phone'        => $request->phone,
            'status'       => $request->status ?? $staff->status,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $staff->update($updateData);

        // Manage technician linking
        if ($request->boolean('auto_create_technician')) {
            $existingTech = JasaTechnician::where('user_id', $staff->id)->first();
            if ($existingTech) {
                $existingTech->update([
                    'name'      => $request->name,
                    'specialty' => $request->technician_specialty ?: $existingTech->specialty,
                    'phone'     => $request->phone,
                    'email'     => $request->email,
                ]);
            } else {
                JasaTechnician::create([
                    'tenant_id'      => $tenantId,
                    'name'           => $request->name,
                    'user_id'        => $staff->id,
                    'specialty'      => $request->technician_specialty ?: 'Teknisi Umum',
                    'phone'          => $request->phone,
                    'email'          => $request->email,
                    'current_status' => 'Tersedia',
                    'is_active'      => true,
                ]);
            }
        } elseif ($request->has('link_technician_id')) {
            // Unlink previously linked technicians
            JasaTechnician::where('user_id', $staff->id)
                ->update(['user_id' => null]);

            if ($request->filled('link_technician_id')) {
                JasaTechnician::where('id', $request->link_technician_id)
                    ->where('tenant_id', $tenantId)
                    ->update(['user_id' => $staff->id]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data staf berhasil diperbarui',
            'data'    => $staff->fresh(['jasaRole', 'technician'])
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $tenantId = $this->resolveTenantId($request);
        $staff = User::where('id', $id)->where('tenant_id', $tenantId)->first();

        if (!$staff) {
            return response()->json(['message' => 'Staf tidak ditemukan'], 404);
        }

        if ($staff->id === $request->user()->id) {
            return response()->json(['message' => 'Tidak dapat menghapus akun Anda sendiri'], 400);
        }

        // Unlink any technician
        JasaTechnician::where('user_id', $staff->id)->update(['user_id' => null]);

        $staff->delete();

        return response()->json(['message' => 'Akun staf berhasil dihapus']);
    }
}
