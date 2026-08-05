use Illuminate\Support\Facades\DB;

$tenantIds = DB::table('retail_finance_categories')->select('tenant_id')->distinct()->pluck('tenant_id');
foreach ($tenantIds as $t) {
    foreach (['Modal Usaha', 'Sewa Lapak', 'Penjualan Aset', 'Lain-lain'] as $ic) {
        $exists = DB::table('retail_finance_categories')
                    ->where('tenant_id', $t)
                    ->where('name', $ic)
                    ->where('type', 'income')
                    ->exists();
        if (!$exists) {
            DB::table('retail_finance_categories')->insert([
                'tenant_id' => $t,
                'name' => $ic,
                'type' => 'income',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
echo "Done inserting with DB query builder for all retail tenants!";
