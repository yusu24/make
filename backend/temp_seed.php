<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tenantIds = App\Models\User::pluck('tenant_id')->unique()->filter()->values()->all();

foreach($tenantIds as $tenantId) { 
    $categories = [
        ['name' => 'Pendapatan Jasa / Servis', 'type' => 'income'], 
        ['name' => 'Pendapatan Konsinyasi', 'type' => 'income'], 
        ['name' => 'Pendapatan Cashback', 'type' => 'income'], 
        ['name' => 'Pendapatan Rongsok / Barang Bekas', 'type' => 'income'], 
        ['name' => 'Pemasukan Lain-lain', 'type' => 'income'], 
        ['name' => 'Biaya Listrik, Air & Internet', 'type' => 'expense'], 
        ['name' => 'Biaya Gaji Karyawan', 'type' => 'expense'], 
        ['name' => 'Biaya Sewa Tempat', 'type' => 'expense'], 
        ['name' => 'Biaya Kebersihan & Keamanan', 'type' => 'expense'], 
        ['name' => 'Biaya Perlengkapan Toko (Plastik, ATK)', 'type' => 'expense'], 
        ['name' => 'Biaya Transportasi & Bensin', 'type' => 'expense'], 
        ['name' => 'Biaya Promosi / Iklan', 'type' => 'expense'], 
        ['name' => 'Biaya Perbaikan / Maintenance', 'type' => 'expense'], 
        ['name' => 'Pengeluaran Lain-lain', 'type' => 'expense']
    ]; 
    foreach($categories as $cat) { 
        App\Models\RetailFinanceCategory::firstOrCreate([
            'tenant_id' => $tenantId, 
            'name' => $cat['name'], 
            'type' => $cat['type']
        ]); 
    } 
} 
echo "Force seeded all unique user tenant_ids with all categories\n";
