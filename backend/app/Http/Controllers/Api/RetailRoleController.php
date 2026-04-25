<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailRole;
use Illuminate\Support\Facades\Validator;

class RetailRoleController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $roles = RetailRole::where('tenant_id', $tenantId)->get();
        return response()->json(['data' => $roles]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = RetailRole::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $request->name,
            'permissions' => $request->permissions ?? [],
        ]);

        return response()->json(['message' => 'Role berhasil dibuat', 'data' => $role], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $role = RetailRole::where('id', $id)->where('tenant_id', $tenantId)->first();
        
        if (!$role) return response()->json(['message' => 'Role tidak ditemukan'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role->update([
            'name' => $request->name,
            'permissions' => $request->permissions ?? [],
        ]);

        return response()->json(['message' => 'Role diupdate', 'data' => $role]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $role = RetailRole::where('id', $id)->where('tenant_id', $tenantId)->first();
        
        if (!$role) return response()->json(['message' => 'Role tidak ditemukan'], 404);

        if ($role->users()->count() > 0) {
             return response()->json(['message' => 'Role sedang digunakan oleh staff. Hapus atau pindahkan staff terlebih dahulu.'], 400);
        }

        $role->delete();
        return response()->json(['message' => 'Role dihapus']);
    }
}
