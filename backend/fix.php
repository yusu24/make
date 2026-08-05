
use App\Models\Tenant;
use App\Models\RetailFinanceCategory;

$tenantId = "TN-DS-SY2IUSQU";
$incomeCats = ["Modal Usaha", "Sewa Lapak", "Penjualan Aset", "Lain-lain"];
foreach ($incomeCats as $ic) {
    RetailFinanceCategory::updateOrCreate(
        ["tenant_id" => $tenantId, "name" => $ic, "type" => "income"]
    );
}
echo "Done seeding income for TN-DS-SY2IUSQU!";

