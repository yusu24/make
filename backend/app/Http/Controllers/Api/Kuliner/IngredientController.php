<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Exports\Kuliner\IngredientsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\ImportIngredientsRequest;
use App\Http\Requests\Kuliner\StoreIngredientRequest;
use App\Http\Requests\Kuliner\UpdateIngredientRequest;
use App\Imports\Kuliner\IngredientsImport;
use App\Models\KulinerIngredient;
use App\Services\Kuliner\IngredientStockService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class IngredientController extends Controller
{
    public function __construct(private IngredientStockService $stock)
    {
    }

    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $query = KulinerIngredient::with('supplier')->where('tenant_id', $tenantId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($request->query('low_stock') === '1') {
            $query->whereColumn('stock', '<=', 'min_stock');
        }

        $sort = $request->query('sort', 'name');
        $dir = $request->query('dir', 'asc') === 'desc' ? 'desc' : 'asc';
        if (in_array($sort, ['name', 'stock', 'min_stock', 'last_price', 'category', 'created_at'])) {
            $query->orderBy($sort, $dir);
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreIngredientRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()->tenant_id;
        $initialStock = (float) ($data['stock'] ?? 0);
        unset($data['stock']);

        $ingredient = KulinerIngredient::create($data + ['stock' => 0]);

        if ($initialStock > 0) {
            $this->stock->addStock($ingredient, $initialStock, null, 'Stok awal');
        }

        return response()->json($ingredient->fresh('supplier'), 201);
    }

    public function show(Request $request, int $id)
    {
        $ingredient = KulinerIngredient::with('supplier')
            ->where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        return response()->json($ingredient);
    }

    public function update(UpdateIngredientRequest $request, int $id)
    {
        $ingredient = KulinerIngredient::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $ingredient->update($request->validated());

        return response()->json($ingredient->fresh('supplier'));
    }

    public function destroy(Request $request, int $id)
    {
        $ingredient = KulinerIngredient::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $recipeCount = $ingredient->recipeItems()->count();
        if ($recipeCount > 0) {
            return response()->json([
                'message' => "Bahan baku ini masih dipakai di {$recipeCount} resep menu. Hapus dari resep terlebih dahulu.",
            ], 422);
        }

        $ingredient->delete();

        return response()->json(['message' => 'Bahan baku dihapus']);
    }

    public function movements(Request $request, int $id)
    {
        $ingredient = KulinerIngredient::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $movements = $ingredient->stockMovements()
            ->with('user')
            ->latest('created_at')
            ->paginate(min((int) $request->query('per_page', 15), 100));

        return response()->json($movements);
    }

    public function adjustStock(Request $request, int $id)
    {
        $request->validate([
            'quantity' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $ingredient = KulinerIngredient::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $this->stock->adjustStock($ingredient, (float) $request->quantity, null, $request->note ?? 'Penyesuaian manual');

        return response()->json($ingredient->fresh());
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(new IngredientsExport($request->user()->tenant_id), 'bahan-baku.xlsx');
    }

    public function importExcel(ImportIngredientsRequest $request)
    {
        $import = new IngredientsImport($request->user()->tenant_id, $this->stock);
        Excel::import($import, $request->file('file'));

        return response()->json([
            'message' => 'Import selesai',
            'summary' => $import->summary(),
        ]);
    }
}
