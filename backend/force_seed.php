use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

$tenants = Tenant::all();
foreach ($tenants as $t) {
    if ($t->businessCategory && $t->businessCategory->slug === 'toko-retail') {
        foreach (['Modal Usaha', 'Sewa Lapak', 'Penjualan Aset', 'Lain-lain'] as $ic) {
            $exists = DB::table('retail_finance_categories')
                        ->where('tenant_id', $t->tenant_id)
                        ->where('name', $ic)
                        ->where('type', 'income')
                        ->exists();
            if (!$exists) {
                DB::table('retail_finance_categories')->insert([
                    'tenant_id' => $t->tenant_id,
                    'name' => $ic,
                    'type' => 'income',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}
echo "Done inserting with DB query builder!";
