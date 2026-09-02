<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaFinanceCategory;
use App\Models\BudidayaUnit;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class MasterDataController extends Controller
{
    private function ensureTablesExist($tenantId)
    {
        // 1. Ensure Finance Categories Table
        if (!Schema::hasTable('budidaya_finance_categories')) {
            Schema::create('budidaya_finance_categories', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 32)->index();
                $table->string('name', 100);
                $table->enum('type', ['income', 'expense'])->default('expense');
                $table->string('code', 50)->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Auto-seed default financial categories if none exist for tenant
        if (BudidayaFinanceCategory::where('tenant_id', $tenantId)->count() === 0) {
            $defaultExpenses = [
                ['name' => 'Pakan', 'type' => 'expense', 'description' => 'Biaya pakan pelet, apung, tenggelam, dll.'],
                ['name' => 'Bibit / Benih', 'type' => 'expense', 'description' => 'Pembelian benih/anakan tebar'],
                ['name' => 'Pupuk / Nutrisi', 'type' => 'expense', 'description' => 'Pupuk organik, kompos, pupuk dasar kolam'],
                ['name' => 'Obat & Vitamin', 'type' => 'expense', 'description' => 'Probiotik, vaksin, garam ikan, molase'],
                ['name' => 'Listrik & Air', 'type' => 'expense', 'description' => 'Tagihan listrik aerator, pompa air sumur'],
                ['name' => 'Bahan Bakar', 'type' => 'expense', 'description' => 'Bensin / solar genset dan operasional'],
                ['name' => 'Tenaga Kerja', 'type' => 'expense', 'description' => 'Upah harian / gaji pekerja farm'],
                ['name' => 'Pemeliharaan Alat', 'type' => 'expense', 'description' => 'Perbaikan jaring, terpal, pipa, mesin'],
                ['name' => 'Lainnya', 'type' => 'expense', 'description' => 'Pengeluaran operasional umum lainnya']
            ];

            $defaultIncomes = [
                ['name' => 'Penjualan Hasil Panen', 'type' => 'income', 'description' => 'Penjualan komoditas panen utama ke pasar/pengepul'],
                ['name' => 'Penjualan Pupuk / Kompos', 'type' => 'income', 'description' => 'Penjualan limbah kotoran ternak / kompos olahan'],
                ['name' => 'Penjualan Bibit / Anakan', 'type' => 'income', 'description' => 'Penjualan sisa sortir benih & anakan'],
                ['name' => 'Hasil Sampingan Ternak', 'type' => 'income', 'description' => 'Penjualan telur, bulu, kulit, dll.'],
                ['name' => 'Subsidi / Hibah Peternakan', 'type' => 'income', 'description' => 'Bantuan dinas / kemitraan'],
                ['name' => 'Modal Tambahan', 'type' => 'income', 'description' => 'Injeksi modal kas pemilik / investor'],
                ['name' => 'Pendapatan Lain-lain', 'type' => 'income', 'description' => 'Pemasukan non-operasional lainnya']
            ];

            foreach (array_merge($defaultExpenses, $defaultIncomes) as $cat) {
                BudidayaFinanceCategory::create(array_merge($cat, [
                    'tenant_id' => $tenantId,
                    'is_default' => true,
                    'is_active' => true
                ]));
            }
        }

        // 2. Ensure Units Table
        if (!Schema::hasTable('budidaya_units')) {
            Schema::create('budidaya_units', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 32)->index();
                $table->string('name', 100);
                $table->string('symbol', 20)->nullable();
                $table->string('category', 50)->default('jumlah');
                $table->text('description')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Auto-seed default units if none exist for tenant
        if (BudidayaUnit::where('tenant_id', $tenantId)->count() === 0) {
            $defaultUnits = [
                ['name' => 'Kilogram', 'symbol' => 'kg', 'category' => 'berat', 'description' => 'Satuan standar berat pakan & panen'],
                ['name' => 'Gram', 'symbol' => 'g', 'category' => 'berat', 'description' => 'Satuan bobot sampling anakan'],
                ['name' => 'Ton / Kuintal', 'symbol' => 'ton', 'category' => 'berat', 'description' => 'Satuan hasil panen partai besar'],
                ['name' => 'Ekor', 'symbol' => 'ekor', 'category' => 'jumlah', 'description' => 'Satuan populasi ikan / ternak'],
                ['name' => 'Bibit / Batang', 'symbol' => 'bibit', 'category' => 'jumlah', 'description' => 'Satuan tebar benih / bibit'],
                ['name' => 'Karung / Sak', 'symbol' => 'sak', 'category' => 'kemasan', 'description' => 'Kemasan pakan sak 20kg / 50kg'],
                ['name' => 'Botol / Jerigen', 'symbol' => 'btl', 'category' => 'kemasan', 'description' => 'Kemasan vitamin, probiotik cair'],
                ['name' => 'Liter', 'symbol' => 'L', 'category' => 'volume', 'description' => 'Satuan volume cairan & bahan bakar'],
                ['name' => 'Paket / Dus', 'symbol' => 'pkt', 'category' => 'kemasan', 'description' => 'Paket perlengkapan farm']
            ];

            foreach ($defaultUnits as $u) {
                BudidayaUnit::create(array_merge($u, [
                    'tenant_id' => $tenantId,
                    'is_default' => true,
                    'is_active' => true
                ]));
            }
        }
    }

    // ─── 1. FINANCIAL CATEGORIES (POS KEUANGAN) ──────────────────────────────
    public function indexFinanceCategories(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $type = $request->query('type');
        $query = BudidayaFinanceCategory::where('tenant_id', $tenantId);

        if ($type) {
            $query->where('type', $type);
        }

        return response()->json(['data' => $query->orderBy('type')->orderBy('name')->get()]);
    }

    public function storeFinanceCategory(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:income,expense',
            'description' => 'nullable|string|max:255',
        ]);

        $category = BudidayaFinanceCategory::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'type' => $request->type,
            'code' => $request->code,
            'description' => $request->description,
            'is_default' => false,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Pos keuangan berhasil ditambahkan', 'data' => $category], 201);
    }

    public function updateFinanceCategory(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $category = BudidayaFinanceCategory::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:income,expense',
            'description' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update([
            'name' => $request->name,
            'type' => $request->type,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->has('is_active') ? $request->is_active : $category->is_active,
        ]);

        return response()->json(['message' => 'Pos keuangan berhasil diperbarui', 'data' => $category]);
    }

    public function destroyFinanceCategory(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $category = BudidayaFinanceCategory::where('tenant_id', $tenantId)->findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Pos keuangan berhasil dihapus']);
    }

    // ─── 2. MASTER SATUAN DASAR (UNITS) ──────────────────────────────────────
    public function indexUnits(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $query = BudidayaUnit::where('tenant_id', $tenantId);
        return response()->json(['data' => $query->orderBy('category')->orderBy('name')->get()]);
    }

    public function storeUnit(Request $request)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $request->validate([
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:20',
            'category' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
        ]);

        $unit = BudidayaUnit::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'symbol' => $request->symbol,
            'category' => $request->category ?? 'jumlah',
            'description' => $request->description,
            'is_default' => false,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Satuan dasar berhasil ditambahkan', 'data' => $unit], 201);
    }

    public function updateUnit(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $unit = BudidayaUnit::where('tenant_id', $tenantId)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:20',
            'category' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $unit->update([
            'name' => $request->name,
            'symbol' => $request->symbol,
            'category' => $request->category ?? $unit->category,
            'description' => $request->description,
            'is_active' => $request->has('is_active') ? $request->is_active : $unit->is_active,
        ]);

        return response()->json(['message' => 'Satuan dasar berhasil diperbarui', 'data' => $unit]);
    }

    public function destroyUnit(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $this->ensureTablesExist($tenantId);

        $unit = BudidayaUnit::where('tenant_id', $tenantId)->findOrFail($id);
        $unit->delete();

        return response()->json(['message' => 'Satuan dasar berhasil dihapus']);
    }
}
