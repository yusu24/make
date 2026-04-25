<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('businessCategory')->latest();

        if ($request->search) {
            $q = $request->search;
            $query->where(fn ($q2) => $q2->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"));
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->paginate($request->per_page ?? 20);

        $data = collect($users->items())->map(fn ($u) => [
            'id'       => $u->id,
            'name'     => $u->name,
            'email'    => $u->email,
            'role'     => $u->role,
            'status'   => $u->status,
            'category' => $u->businessCategory?->name ?? '-',
            'joined'   => $u->created_at->format('Y-m-d'),
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
        $user->load('businessCategory', 'tenant');
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'in:admin,customer,super_admin',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'customer',
            'status'   => 'active',
            'business_category_id' => $request->business_category_id,
        ]);

        ActivityLog::record('create_user', 'User: ' . $user->name, 'success');

        return response()->json(['success' => true, 'message' => 'Pengguna berhasil dibuat', 'data' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->only('name', 'email', 'role', 'status', 'business_category_id', 'phone'));
        ActivityLog::record('edit_user', 'User: ' . $user->name, 'info');
        return response()->json(['success' => true, 'message' => 'Pengguna diperbarui']);
    }

    public function destroy(User $user)
    {
        if ($user->isSuperAdmin()) {
            return response()->json(['success' => false, 'message' => 'Super Admin tidak dapat dihapus'], 403);
        }
        ActivityLog::record('delete_user', 'User: ' . $user->name, 'danger');
        $user->delete();
        return response()->json(['success' => true, 'message' => 'Pengguna dihapus']);
    }

    public function updateStatus(Request $request, User $user)
    {
        $user->update(['status' => $request->status]);
        ActivityLog::record('toggle_user_status', 'User: ' . $user->name, 'info');
        return response()->json(['success' => true, 'message' => 'Status diperbarui']);
    }
}
