<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\RetailCategory;
use App\Models\RetailSupplier;
use App\Models\RetailCustomer;
use App\Models\RetailUnit;
use App\Models\RetailFinanceCategory;
use App\Models\RetailSetting;

class RetailMasterController extends Controller
{
    public function getCategories(Request $request) {
        return response()->json(RetailCategory::get());
    }

    public function storeCategory(Request $request) {
        $validator = Validator::make($request->all(), ['name' => 'required|string|max:255']);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cat = RetailCategory::create(['name' => $request->name]);
        return response()->json($cat);
    }

    public function updateCategory(Request $request, int $id) {
        $validator = Validator::make($request->all(), ['name' => 'required|string|max:255']);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cat = RetailCategory::findOrFail($id);
        $cat->update(['name' => $request->name]);
        return response()->json($cat);
    }

    public function destroyCategory(Request $request, int $id) {
        RetailCategory::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getSuppliers(Request $request) {
        return response()->json(RetailSupplier::latest()->get());
    }

    private function supplierRules(): array {
        return [
            'name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ];
    }

    public function storeSupplier(Request $request) {
        $validator = Validator::make($request->all(), $this->supplierRules());
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sup = RetailSupplier::create([
            'name' => $request->name,
            'contact' => $request->contact,
            'address' => $request->address
        ]);
        return response()->json($sup);
    }

    public function updateSupplier(Request $request, int $id) {
        $validator = Validator::make($request->all(), $this->supplierRules());
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sup = RetailSupplier::findOrFail($id);
        $sup->update([
            'name' => $request->name,
            'contact' => $request->contact,
            'address' => $request->address
        ]);
        return response()->json($sup);
    }

    public function destroySupplier(Request $request, int $id) {
        RetailSupplier::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getCustomers(Request $request) {
        return response()->json(RetailCustomer::latest()->get());
    }

    private function customerRules(): array {
        return [
            'name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ];
    }

    public function storeCustomer(Request $request) {
        $validator = Validator::make($request->all(), $this->customerRules());
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cus = RetailCustomer::create([
            'name' => $request->name,
            'contact' => $request->contact,
            'email' => $request->email,
            'address' => $request->address
        ]);
        return response()->json($cus);
    }

    public function updateCustomer(Request $request, int $id) {
        $validator = Validator::make($request->all(), $this->customerRules());
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cus = RetailCustomer::findOrFail($id);
        $cus->update([
            'name' => $request->name,
            'contact' => $request->contact,
            'email' => $request->email,
            'address' => $request->address
        ]);
        return response()->json($cus);
    }

    public function destroyCustomer(Request $request, int $id) {
        RetailCustomer::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // Units
    public function getUnits(Request $request) {
        return response()->json(RetailUnit::get());
    }

    public function storeUnit(Request $request) {
        $validator = Validator::make($request->all(), ['name' => 'required|string|max:255']);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $unit = RetailUnit::create(['name' => $request->name]);
        return response()->json($unit);
    }

    public function updateUnit(Request $request, int $id) {
        $validator = Validator::make($request->all(), ['name' => 'required|string|max:255']);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $unit = RetailUnit::findOrFail($id);
        $unit->update(['name' => $request->name]);
        return response()->json($unit);
    }

    public function destroyUnit(Request $request, int $id) {
        RetailUnit::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---------------------------------------------------------------------------------------------------
    // FINANCE CATEGORIES (INCOME & EXPENSE)
    // ---------------------------------------------------------------------------------------------------

    public function getFinanceCategories(Request $request) {
        $type = $request->query('type');
        $query = RetailFinanceCategory::query();
        if ($type) {
            $query->where('type', $type);
        }
        return response()->json($query->get());
    }

    public function storeFinanceCategory(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense'
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cat = RetailFinanceCategory::create([
            'name' => $request->name,
            'type' => $request->type
        ]);
        return response()->json($cat);
    }

    public function updateFinanceCategory(Request $request, int $id) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense'
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cat = RetailFinanceCategory::findOrFail($id);
        $cat->update([
            'name' => $request->name,
            'type' => $request->type
        ]);
        return response()->json($cat);
    }

    public function destroyFinanceCategory(Request $request, int $id) {
        RetailFinanceCategory::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ─── Settings ────────────────────────────────────────────────────────────────

    private function getOrCreateSettings(Request $request): RetailSetting
    {
        return RetailSetting::firstOrCreate(
            ['tenant_id' => $request->user()->tenant_id],
            [
                'tax_rate'                    => 0,
                'points_ratio'                => 10000,
                'low_stock_default_threshold' => 5,
                'enable_tax'                  => true,
                'enable_loyalty'              => true,
                'currency'                    => 'IDR',
            ]
        );
    }

    private function withQrisUrl(array $data): array
    {
        $data['qris_image_url'] = !empty($data['qris_image_path'])
            ? asset('storage/' . $data['qris_image_path'])
            : null;
        $data['store_icon_url'] = !empty($data['store_icon_path'])
            ? asset('storage/' . $data['store_icon_path'])
            : null;
        return $data;
    }

    public function getSettings(Request $request)
    {
        $settings = $this->getOrCreateSettings($request);
        return response()->json($this->withQrisUrl($settings->toArray()));
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_name'                  => 'nullable|string|max:120',
            'store_address'               => 'nullable|string|max:500',
            'store_phone'                 => 'nullable|string|max:30',
            'currency'                    => 'nullable|string|max:10',
            'tax_rate'                    => 'nullable|numeric|min:0|max:100',
            'enable_tax'                  => 'nullable|boolean',
            'points_ratio'                => 'nullable|integer|min:1',
            'enable_loyalty'              => 'nullable|boolean',
            'low_stock_default_threshold' => 'nullable|numeric|min:0',
            'receipt_header'              => 'nullable|string|max:500',
            'receipt_footer'              => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = $this->getOrCreateSettings($request);
        $settings->update($validator->validated());

        return response()->json($this->withQrisUrl($settings->fresh()->toArray()));
    }

    public function uploadQris(Request $request)
    {
        // 5MB, not 2MB — real QRIS photos/screenshots from a phone routinely
        // land in the 2-5MB range and were getting rejected by the old limit.
        $request->validate([
            'qris_image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $settings = $this->getOrCreateSettings($request);

        // Delete old QRIS if exists
        if ($settings->qris_image_path) {
            Storage::disk('public')->delete($settings->qris_image_path);
        }

        $path = $request->file('qris_image')->store('retail/qris', 'public');
        $settings->update(['qris_image_path' => $path]);

        return response()->json([
            'qris_image_path' => $path,
            'qris_image_url'  => asset('storage/' . $path),
        ]);
    }

    public function deleteQris(Request $request)
    {
        $settings = $this->getOrCreateSettings($request);

        if ($settings->qris_image_path) {
            Storage::disk('public')->delete($settings->qris_image_path);
            $settings->update(['qris_image_path' => null]);
        }

        return response()->json(['message' => 'QRIS dihapus']);
    }

    public function uploadStoreIcon(Request $request)
    {
        $request->validate([
            'store_icon' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $settings = $this->getOrCreateSettings($request);

        if ($settings->store_icon_path) {
            Storage::disk('public')->delete($settings->store_icon_path);
        }

        $path = $request->file('store_icon')->store('retail/store-icon', 'public');
        $settings->update(['store_icon_path' => $path]);

        return response()->json([
            'store_icon_path' => $path,
            'store_icon_url'  => asset('storage/' . $path),
        ]);
    }

    public function deleteStoreIcon(Request $request)
    {
        $settings = $this->getOrCreateSettings($request);

        if ($settings->store_icon_path) {
            Storage::disk('public')->delete($settings->store_icon_path);
            $settings->update(['store_icon_path' => null]);
        }

        return response()->json(['message' => 'Icon toko dihapus']);
    }
}
