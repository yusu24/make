<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaRole;
use App\Models\BudidayaStaff;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    // Default permission structure for new roles
    private array $defaultPermissions = [
        'lihat_laporan'      => false,
        'ekspor_data'        => false,
        'bagikan_analitik'   => false,
        'kelola_kolam'       => false,
        'hapus_kolam'        => false,
        'ganti_alarm'        => false,
        'tambah_pengguna'    => false,
        'edit_peran'         => false,
        'hapus_pengguna'     => false,
    ];

    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        // Seed default roles if none exist for this tenant
        $this->seedDefaultRoles($tenantId);

        $roles = BudidayaRole::where('tenant_id', $tenantId)
            ->withCount('staff')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $roles]);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';

        $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $role = BudidayaRole::create([
            'tenant_id'   => $tenantId,
            'name'        => $request->name,
            'slug'        => Str::slug($request->name, '_'),
            'description' => $request->description,
            'is_system'   => false,
            'permissions' => array_merge($this->defaultPermissions, $request->permissions ?? []),
        ]);

        return response()->json([
            'message' => 'Peran berhasil dibuat',
            'data'    => $role,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $role     = BudidayaRole::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $role->update([
            'name'        => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions ?? $role->permissions,
        ]);

        return response()->json([
            'message' => 'Peran diperbarui',
            'data'    => $role,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $role     = BudidayaRole::where('tenant_id', $tenantId)->findOrFail($id);

        if ($role->is_system) {
            return response()->json(['message' => 'Peran bawaan sistem tidak bisa dihapus.'], 422);
        }

        // Unassign staff from this role before deleting
        BudidayaStaff::where('budidaya_role_id', $role->id)->update(['budidaya_role_id' => null]);
        $role->delete();

        return response()->json(['message' => 'Peran berhasil dihapus']);
    }

    // ── Seed default roles for a tenant ───────────────────────────────────────
    private function seedDefaultRoles(string $tenantId): void
    {
        if (BudidayaRole::where('tenant_id', $tenantId)->exists()) {
            return;
        }

        $defaults = [
            [
                'name'        => 'Admin',
                'slug'        => 'admin',
                'description' => 'Akses penuh ke seluruh fitur sistem.',
                'is_system'   => true,
                'permissions' => array_fill_keys(array_keys($this->defaultPermissions), true),
            ],
            [
                'name'        => 'Manajer Tambak',
                'slug'        => 'manajer',
                'description' => 'Mengelola operasional kolam dan laporan.',
                'is_system'   => true,
                'permissions' => [
                    'lihat_laporan'      => true,
                    'ekspor_data'        => true,
                    'bagikan_analitik'   => false,
                    'kelola_kolam'       => true,
                    'hapus_kolam'        => false,
                    'ganti_alarm'        => true,
                    'tambah_pengguna'    => true,
                    'edit_peran'         => false,
                    'hapus_pengguna'     => false,
                ],
            ],
            [
                'name'        => 'Pekerja Lapangan',
                'slug'        => 'pekerja',
                'description' => 'Akses terbatas untuk operasi harian di lapangan.',
                'is_system'   => true,
                'permissions' => array_fill_keys(array_keys($this->defaultPermissions), false),
            ],
        ];

        foreach ($defaults as $def) {
            BudidayaRole::create(array_merge($def, ['tenant_id' => $tenantId]));
        }
    }
}
