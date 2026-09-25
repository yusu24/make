<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaStaff;
use App\Models\BudidayaRole;
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;

class StaffController extends Controller
{
    private function getTenantId(Request $request): string
    {
        $tenantId = $request->attributes->get('tenant_id') ?? $request->user()?->tenant_id;
        if (empty($tenantId)) {
            abort(response()->json(['message' => 'Unauthorized: No Tenant ID associated with this user.'], 403));
        }
        return $tenantId;
    }

    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
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
                'security' => 98,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'nullable|email',
            'phone'            => 'nullable|string|max:20',
            'position'         => 'nullable|string|max:100',
            'budidaya_role_id' => [
                'nullable',
                Rule::exists('budidaya_roles', 'id')->where('tenant_id', $tenantId)
            ],
            'status'           => 'nullable|in:aktif,tidak_aktif',
        ]);

        $staff = BudidayaStaff::create([
            'tenant_id'        => $tenantId,
            'name'             => $validated['name'],
            'email'            => $validated['email'] ?? null,
            'phone'            => $validated['phone'] ?? null,
            'position'         => $validated['position'] ?? null,
            'budidaya_role_id' => $validated['budidaya_role_id'] ?? null,
            'status'           => $validated['status'] ?? 'aktif',
        ]);

        return response()->json([
            'message' => 'Staf berhasil ditambahkan',
            'data'    => $staff->load('role'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $staff    = BudidayaStaff::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'nullable|email',
            'phone'            => 'nullable|string|max:20',
            'position'         => 'nullable|string|max:100',
            'budidaya_role_id' => [
                'nullable',
                Rule::exists('budidaya_roles', 'id')->where('tenant_id', $tenantId)
            ],
            'status'           => 'nullable|in:aktif,tidak_aktif',
        ]);

        $staff->update([
            'name'             => $validated['name'],
            'email'            => $validated['email'] ?? null,
            'phone'            => $validated['phone'] ?? null,
            'position'         => $validated['position'] ?? null,
            'budidaya_role_id' => $validated['budidaya_role_id'] ?? null,
            'status'           => $validated['status'] ?? $staff->status,
        ]);

        return response()->json([
            'message' => 'Data staf diperbarui',
            'data'    => $staff->load('role'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $staff    = BudidayaStaff::where('tenant_id', $tenantId)->findOrFail($id);
        $staff->delete();

        return response()->json(['message' => 'Staf berhasil dihapus']);
    }
}
