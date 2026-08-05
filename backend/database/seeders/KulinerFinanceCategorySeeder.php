<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\KulinerFinanceCategory;

class KulinerFinanceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $tenants = User::whereNotNull('tenant_id')->distinct()->pluck('tenant_id');
        
        $categories = [
            ['name' => 'Gaji Karyawan', 'type' => 'expense'],
            ['name' => 'Operasional (Listrik, Air, Gas)', 'type' => 'expense'],
            ['name' => 'Sewa Tempat', 'type' => 'expense'],
            ['name' => 'Bahan Baku', 'type' => 'expense'],
            ['name' => 'Kas Kecil (Kembalian)', 'type' => 'expense'],
            ['name' => 'Biaya Kemasan', 'type' => 'expense'],
            ['name' => 'Lainnya', 'type' => 'expense'],
            ['name' => 'Penjualan Tambahan', 'type' => 'income'],
            ['name' => 'Suntikan Modal', 'type' => 'income'],
            ['name' => 'Pendapatan Lain', 'type' => 'income'],
        ];

        foreach ($tenants as $tenantId) {
            foreach ($categories as $cat) {
                KulinerFinanceCategory::firstOrCreate([
                    'tenant_id' => $tenantId,
                    'name' => $cat['name'],
                    'type' => $cat['type']
                ], [
                    'is_active' => true
                ]);
            }
        }
    }
}
