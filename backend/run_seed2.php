use App\Models\Tenant;
use App\Models\RetailFinanceCategory;

foreach(Tenant::all() as $tenant) {
    // If tenant has any retail expense category, it's a retail tenant
    $hasRetail = RetailFinanceCategory::where('tenant_id', $tenant->tenant_id)->exists();
    
    if ($hasRetail) {
        $expenseCats = ['Operasional Toko', 'Gaji Karyawan', 'Sewa Tempat', 'Listrik & Air', 'Lain-lain'];
        foreach ($expenseCats as $ec) {
            RetailFinanceCategory::updateOrCreate(
                ['tenant_id' => $tenant->tenant_id, 'name' => $ec, 'type' => 'expense']
            );
        }
        $incomeCats = ['Modal Usaha', 'Sewa Lapak', 'Penjualan Aset', 'Lain-lain'];
        foreach ($incomeCats as $ic) {
            RetailFinanceCategory::updateOrCreate(
                ['tenant_id' => $tenant->tenant_id, 'name' => $ic, 'type' => 'income']
            );
        }
    }
}
echo "Seeded finance categories for existing retail tenants!";
