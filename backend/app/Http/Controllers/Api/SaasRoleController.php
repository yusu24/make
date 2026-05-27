<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SaasRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\ActivityLog;

class SaasRoleController extends Controller
{
    public function index()
    {
        $roles = SaasRole::withCount('users')->latest()->get();
        return response()->json([
            'success' => true,
            'data'    => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255|unique:saas_roles,name',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $role = SaasRole::create([
            'name'        => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions ?? [],
        ]);

        ActivityLog::record('create_saas_role', 'Role: ' . $role->name, 'success');

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat',
            'data'    => $role,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $role = SaasRole::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255|unique:saas_roles,name,' . $role->id,
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $role->update([
            'name'        => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions ?? [],
        ]);

        ActivityLog::record('update_saas_role', 'Role: ' . $role->name, 'info');

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui',
            'data'    => $role,
        ]);
    }

    public function destroy($id)
    {
        $role = SaasRole::findOrFail($id);

        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak dapat dihapus karena masih digunakan oleh admin',
            ], 400);
        }

        ActivityLog::record('delete_saas_role', 'Role: ' . $role->name, 'danger');
        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dihapus',
        ]);
    }
}
