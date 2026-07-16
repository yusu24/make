<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\StoreWasteRequest;
use App\Models\KulinerIngredient;
use App\Models\KulinerWaste;
use App\Services\Kuliner\IngredientStockService;
use App\Services\Kuliner\WasteService;
use Illuminate\Http\Request;

class WasteController extends Controller
{
    public function __construct(private WasteService $wasteService, private IngredientStockService $stock)
    {
    }

    public function index(Request $request)
    {
        $query = KulinerWaste::with('ingredient', 'user')
            ->where('tenant_id', $request->user()->tenant_id)
            ->latest('waste_date');

        if ($from = $request->query('date_from')) {
            $query->whereDate('waste_date', '>=', $from);
        }
        if ($to = $request->query('date_to')) {
            $query->whereDate('waste_date', '<=', $to);
        }

        $wastes = $query->paginate(min((int) $request->query('per_page', 15), 100));

        return response()->json($wastes);
    }

    public function store(StoreWasteRequest $request)
    {
        $ingredient = KulinerIngredient::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($request->ingredient_id);

        try {
            $waste = $this->wasteService->recordWaste(
                $ingredient,
                (float) $request->quantity,
                $request->reason,
                $request->waste_date,
                $request->note
            );

            return response()->json($waste->load('ingredient'), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $waste = KulinerWaste::with('ingredient')->where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        if ($waste->ingredient) {
            $this->stock->restore($waste->ingredient, (float) $waste->quantity, null, "Pembatalan catatan waste #{$waste->id}");
        }
        $waste->delete();

        return response()->json(['message' => 'Catatan waste dihapus dan stok dikembalikan']);
    }
}
