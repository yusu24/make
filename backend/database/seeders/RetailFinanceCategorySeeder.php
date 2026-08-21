<?php

namespace Database\Seeders;

use App\Models\RetailFinanceCategory;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class RetailFinanceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $categories = [
                // Pemasukan
                ['name' => 'Pendapatan Jasa / Servis', 'type' => 'income'],
                ['name' => 'Pendapatan Konsinyasi', 'type' => 'income'],
                ['name' => 'Pendapatan Cashback', 'type' => 'income'],
                ['name' => 'Pendapatan Rongsok / Barang Bekas', 'type' => 'income'],
                ['name' => 'Pemasukan Lain-lain', 'type' => 'income'],

                // Pengeluaran
                ['name' => 'Biaya Listrik, Air & Internet', 'type' => 'expense'],
                ['name' => 'Biaya Gaji Karyawan', 'type' => 'expense'],
                ['name' => 'Biaya Sewa Tempat', 'type' => 'expense'],
                ['name' => 'Biaya Kebersihan & Keamanan', 'type' => 'expense'],
                ['name' => 'Biaya Perlengkapan Toko (Plastik, ATK)', 'type' => 'expense'],
                ['name' => 'Biaya Transportasi & Bensin', 'type' => 'expense'],
                ['name' => 'Biaya Promosi / Iklan', 'type' => 'expense'],
                ['name' => 'Biaya Perbaikan / Maintenance', 'type' => 'expense'],
                ['name' => 'Pengeluaran Lain-lain', 'type' => 'expense'],
            ];

            foreach ($categories as $cat) {
                RetailFinanceCategory::firstOrCreate([
                    'tenant_id' => $tenant->id,
                    'name' => $cat['name'],
                    'type' => $cat['type'],
                ]);
            }
        }
    }
}
