<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaInventory;
use App\Models\BudidayaInventoryLog;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->query('category');
        $search = $request->query('search');
        $perPage = $request->query('per_page', 50);

        $query = BudidayaInventory::query();

        if ($category && $category !== 'Semua') {
            $catLower = strtolower(trim($category));

            $query->where(function ($q) use ($catLower) {
                if (str_contains($catLower, 'pakan') || str_contains($catLower, 'konsentrat') || str_contains($catLower, 'pelet') || str_contains($catLower, 'starter') || str_contains($catLower, 'finisher') || str_contains($catLower, 'biji') || str_contains($catLower, 'hijauan') || str_contains($catLower, 'silase') || str_contains($catLower, 'fooding')) {
                    $q->where('category', 'like', '%pakan%')
                      ->orWhere('category', 'like', '%konsentrat%')
                      ->orWhere('category', 'like', '%hijauan%')
                      ->orWhere('category', 'like', '%silase%')
                      ->orWhere('category', 'like', '%pelet%')
                      ->orWhere('category', 'like', '%fooding%');
                } elseif (str_contains($catLower, 'bibit') || str_contains($catLower, 'bakalan') || str_contains($catLower, 'pedet') || str_contains($catLower, 'doc') || str_contains($catLower, 'benih') || str_contains($catLower, 'indukan') || str_contains($catLower, 'anakan')) {
                    $q->where('category', 'like', '%bibit%')
                      ->orWhere('category', 'like', '%benih%')
                      ->orWhere('category', 'like', '%bakalan%')
                      ->orWhere('category', 'like', '%pedet%')
                      ->orWhere('category', 'like', '%doc%')
                      ->orWhere('category', 'like', '%indukan%')
                      ->orWhere('category', 'like', '%anakan%');
                } elseif (str_contains($catLower, 'obat') || str_contains($catLower, 'vitamin') || str_contains($catLower, 'vaksin') || str_contains($catLower, 'suplemen') || str_contains($catLower, 'probiotik') || str_contains($catLower, 'pestisida')) {
                    $q->where('category', 'like', '%obat%')
                      ->orWhere('category', 'like', '%vitamin%')
                      ->orWhere('category', 'like', '%vaksin%')
                      ->orWhere('category', 'like', '%suplemen%')
                      ->orWhere('category', 'like', '%probiotik%')
                      ->orWhere('category', 'like', '%pestisida%');
                } elseif (str_contains($catLower, 'alat') || str_contains($catLower, 'peralatan') || str_contains($catLower, 'ring') || str_contains($catLower, 'sangkar')) {
                    $q->where('category', 'like', '%alat%')
                      ->orWhere('category', 'like', '%peralatan%')
                      ->orWhere('category', 'like', '%ring%')
                      ->orWhere('category', 'like', '%sangkar%');
                } elseif (str_contains($catLower, 'pupuk')) {
                    $q->where('category', 'like', '%pupuk%');
                } else {
                    $q->where('category', 'like', "%{$catLower}%");
                }
            });
        }

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $items = $query->orderBy('name')->paginate($perPage);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'stock' => 'required|numeric',
            'unit' => 'required|string',
            'min_stock' => 'nullable|numeric',
            'price_per_unit' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $tenantId = $request->user()->tenant_id ?? 'TN-001';
        $item = BudidayaInventory::create(array_merge($validated, ['tenant_id' => $tenantId]));

        // Log initial stock
        if ($item->stock > 0) {
            BudidayaInventoryLog::create([
                'inventory_id' => $item->id,
                'type' => 'in',
                'quantity' => $item->stock,
                'note' => 'Stok awal',
                'transaction_date' => now(),
            ]);
        }

        return response()->json(['message' => 'Barang berhasil ditambahkan', 'data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = BudidayaInventory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'unit' => 'required|string',
            'min_stock' => 'nullable|numeric',
            'price_per_unit' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $item->update($validated);

        return response()->json(['message' => 'Data barang diperbarui', 'data' => $item]);
    }

    public function updateStock(Request $request, $id)
    {
        $item = BudidayaInventory::findOrFail($id);

        $validated = $request->validate([
            'type' => 'required|in:in,out',
            'quantity' => 'required|numeric|min:0.01',
            'note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($item, $validated) {
            if ($validated['type'] === 'in') {
                $item->increment('stock', $validated['quantity']);
            } else {
                $item->decrement('stock', $validated['quantity']);
            }

            BudidayaInventoryLog::create([
                'inventory_id' => $item->id,
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'note' => $validated['note'],
                'transaction_date' => now(),
            ]);
        });

        return response()->json(['message' => 'Stok berhasil diperbarui', 'data' => $item->fresh()]);
    }

    public function destroy(Request $request, $id)
    {
        $item = BudidayaInventory::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Barang berhasil dihapus']);
    }

    public function logs(Request $request, $id)
    {
        $perPage = $request->query('per_page', 15);
        $item = BudidayaInventory::findOrFail($id);
        $logs = $item->logs()->orderBy('transaction_date', 'desc')->paginate($perPage);

        return response()->json($logs);
    }
}
