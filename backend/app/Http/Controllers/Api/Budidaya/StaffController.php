<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaStaff;
use App\Models\BudidayaRole;
use Illuminate\Support\Carbon;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $search   = $request->query('search');
        $status   = $request->query('status');

        $query = BudidayaStaff::with('role')
            ->where('tenant_id', $tenantId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email','like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $staff = $query->orderBy('name')->paginate(10);

        // Compute stats
        $total      = BudidayaStaff::where('tenant_id', $tenantId)->count();
        $active     = BudidayaStaff::where('tenant_id', $tenantId)->where('status', 'aktif')->count();
        $managerRole= BudidayaRole::where('tenant_id', $tenantId)->where('slug', 'manajer')->first();
        $managers   = $managerRole
            ? BudidayaStaff::where('tenant_id', $tenantId)->where('budidaya_role_id', $managerRole->id)->count()
            : 0;

        return response()->json([
            'data' => $staff,
            'stats' => [
                'total'    => $total,
                'active'   => $active,
                'managers' => $managers,
                'security' => 98, // placeholder MFA health
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'nullable|email',
            'phone'            => 'nullable|string|max:20',
            'position'         => 'nullable|string|max:100',
            'budidaya_role_id' => 'nullable|exists:budidaya_roles,id',
            'status'           => 'in:aktif,tidak_aktif',
        ]);

        $staff = BudidayaStaff::create(array_merge($request->all(), [
            'tenant_id' => $tenantId,
            'status'    => $request->status ?? 'aktif',
        ]));

        return response()->json([
            'message' => 'Staf berhasil ditambahkan',
            'data'    => $staff->load('role'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $staff    = BudidayaStaff::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'nullable|email',
            'phone'            => 'nullable|string|max:20',
            'position'         => 'nullable|string|max:100',
            'budidaya_role_id' => 'nullable|exists:budidaya_roles,id',
            'status'           => 'in:aktif,tidak_aktif',
        ]);

        $staff->update($request->all());

        return response()->json([
            'message' => 'Data staf diperbarui',
            'data'    => $staff->load('role'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $staff    = BudidayaStaff::where('tenant_id', $tenantId)->findOrFail($id);
        $staff->delete();

        return response()->json(['message' => 'Staf berhasil dihapus']);
    }
}
