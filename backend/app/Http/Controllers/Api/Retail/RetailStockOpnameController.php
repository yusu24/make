<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailStockOpname;
use App\Services\Retail\RetailStockOpnameService;
use Illuminate\Http\Request;

class RetailStockOpnameController extends Controller
{
    public function __construct(private RetailStockOpnameService $opnames) {}

    public function index(Request $request)
    {
        return response()->json(RetailStockOpname::with('user')->latest()->get());
    }

    public function show(Request $request, int $id)
    {
        return response()->json(RetailStockOpname::with('items.product')->findOrFail($id));
    }

    public function store(Request $request)
    {
        try {
            return response()->json($this->opnames->start($request->note), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $opname = RetailStockOpname::findOrFail($id);
            return response()->json($this->opnames->updateCounts($opname, $request->input('items', [])));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function finalize(Request $request, int $id)
    {
        try {
            $opname = RetailStockOpname::findOrFail($id);
            return response()->json($this->opnames->finalize($opname));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $opname = RetailStockOpname::findOrFail($id);
        if ($opname->status === 'finalized') {
            return response()->json(['message' => 'Stock opname yang sudah difinalisasi tidak dapat dihapus.'], 422);
        }
        $opname->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
