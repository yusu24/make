<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JasaRole;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class JasaRoleController extends Controller
{
    private array $defaultPermissions = [
        // SPK / Work Order
        'spk_view_all'         => true,
        'spk_view_assigned'    => true,
        'spk_create'           => true,
        'spk_edit'             => true,
        'spk_update_status'    => true,
        'spk_delete'           => false,
        'spk_print'            => true,
        // POS & Invoicing
        'pos_checkout'         => true,
        'pos_invoices'         => true,
        'pos_discount'         => false,
        // Spareparts
        'inventory_view'       => true,
        'inventory_use_parts'  => true,
        'inventory_manage'     => false,
        // Technicians & Contracts
        'technicians_manage'   => false,
        'contracts_manage'     => true,
        'catalog_manage'       => true,
        // Finance & Staff
        'finance_view'         => false,
        'finance_expenses'     => false,
        'finance_accounts'     => false,
        'staff_manage'         => false,
    ];

    private function resolveTenantId(Request $request): string
    {
        $user = $request->user();
        if ($user && !empty($user->tenant_id)) {
            return $user->tenant_id;
        }
        return 'TN-0001';
    }

    public function index(Request $request)
    {
        $tenantId = $this->resolveTenantId($request);
        $this->seedDefaultRoles($tenantId);

        $roles = JasaRole::where('tenant_id', $tenantId)
            ->withCount('users')
            ->get();

        return response()->json(['data' => $roles]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $this->resolveTenantId($request);

        $role = JasaRole::create([
            'tenant_id'   => $tenantId,
            'name'        => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions ?? $this->defaultPermissions,
        ]);

        return response()->json([
            'message' => 'Role berhasil dibuat',
            'data'    => $role,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $tenantId = $this->resolveTenantId($request);
        $role = JasaRole::where('id', $id)->where('tenant_id', $tenantId)->first();

        // Fallback: If not found by ID (e.g. client had fallback seed ID), attempt match by name for this tenant
        if (!$role && !empty($request->name)) {
            $role = JasaRole::where('tenant_id', $tenantId)->where('name', $request->name)->first();
        }

        if (!$role && !empty($request->name)) {
            $this->seedDefaultRoles($tenantId);
            $role = JasaRole::where('tenant_id', $tenantId)->where('name', $request->name)->first();
        }

        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role->update([
            'name'        => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions ?? [],
        ]);

        return response()->json([
            'message' => 'Role berhasil diperbarui',
            'data'    => $role,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $tenantId = $this->resolveTenantId($request);
        $role = JasaRole::where('id', $id)->where('tenant_id', $tenantId)->first();

        if (!$role) {
            return response()->json(['message' => 'Role tidak ditemukan'], 404);
        }

        // Unlink users attached to this role
        User::where('tenant_id', $tenantId)->where('jasa_role_id', $id)->update(['jasa_role_id' => null]);

        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus']);
    }

    private function seedDefaultRoles(?string $tenantId): void
    {
        if (empty($tenantId)) {
            return;
        }

        if (JasaRole::where('tenant_id', $tenantId)->exists()) {
            return;
        }

        $defaults = [
            [
                'name'        => 'Owner / Manajer',
                'description' => 'Akses penuh ke seluruh operasional, keuangan, dan pengaturan jasa.',
                'permissions' => [
                    'spk_view_all' => true, 'spk_view_assigned' => true, 'spk_create' => true, 'spk_edit' => true,
                    'spk_update_status' => true, 'spk_delete' => true, 'spk_print' => true,
                    'pos_checkout' => true, 'pos_invoices' => true, 'pos_discount' => true,
                    'inventory_view' => true, 'inventory_use_parts' => true, 'inventory_manage' => true,
                    'technicians_manage' => true, 'contracts_manage' => true, 'catalog_manage' => true,
                    'finance_view' => true, 'finance_expenses' => true, 'finance_accounts' => true,
                    'staff_manage' => true,
                ],
            ],
            [
                'name'        => 'Admin / Kasir Toko',
                'description' => 'Membuat SPK, kasir POS, menerima pembayaran faktur, dan cetak nota.',
                'permissions' => [
                    'spk_view_all' => true, 'spk_view_assigned' => true, 'spk_create' => true, 'spk_edit' => true,
                    'spk_update_status' => true, 'spk_delete' => false, 'spk_print' => true,
                    'pos_checkout' => true, 'pos_invoices' => true, 'pos_discount' => true,
                    'inventory_view' => true, 'inventory_use_parts' => true, 'inventory_manage' => false,
                    'technicians_manage' => false, 'contracts_manage' => true, 'catalog_manage' => true,
                    'finance_view' => false, 'finance_expenses' => true, 'finance_accounts' => false,
                    'staff_manage' => false,
                ],
            ],
            [
                'name'        => 'Teknisi / Operator Lapangan',
                'description' => 'Melihat SPK penugasan sendiri, update status servis di lapangan, dan pemakaian sparepart.',
                'permissions' => [
                    'spk_view_all' => false, 'spk_view_assigned' => true, 'spk_create' => false, 'spk_edit' => false,
                    'spk_update_status' => true, 'spk_delete' => false, 'spk_print' => true,
                    'pos_checkout' => false, 'pos_invoices' => false, 'pos_discount' => false,
                    'inventory_view' => true, 'inventory_use_parts' => true, 'inventory_manage' => false,
                    'technicians_manage' => false, 'contracts_manage' => false, 'catalog_manage' => false,
                    'finance_view' => false, 'finance_expenses' => false, 'finance_accounts' => false,
                    'staff_manage' => false,
                ],
            ],
            [
                'name'        => 'Staf Gudang & Sparepart',
                'description' => 'Kelola persediaan suku cadang, material, dan stok barang masuk.',
                'permissions' => [
                    'spk_view_all' => true, 'spk_view_assigned' => false, 'spk_create' => false, 'spk_edit' => false,
                    'spk_update_status' => false, 'spk_delete' => false, 'spk_print' => true,
                    'pos_checkout' => false, 'pos_invoices' => false, 'pos_discount' => false,
                    'inventory_view' => true, 'inventory_use_parts' => true, 'inventory_manage' => true,
                    'technicians_manage' => false, 'contracts_manage' => false, 'catalog_manage' => false,
                    'finance_view' => false, 'finance_expenses' => false, 'finance_accounts' => false,
                    'staff_manage' => false,
                ],
            ],
        ];

        foreach ($defaults as $def) {
            JasaRole::create([
                'tenant_id'   => $tenantId,
                'name'        => $def['name'],
                'description' => $def['description'],
                'permissions' => $def['permissions'],
            ]);
        }
    }
}
