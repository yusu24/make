<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Models\KulinerIngredientOpname;
use App\Services\Kuliner\IngredientOpnameService;
use Illuminate\Http\Request;

class IngredientOpnameController extends Controller
{
    public function __construct(private IngredientOpnameService $service)
    {
    }

    public function index(Request $request)
    {
        $opnames = KulinerIngredientOpname::with('user', 'approver')
            ->where('tenant_id', $request->user()->tenant_id)
            ->latest()
            ->paginate(min((int) $request->query('per_page', 15), 100));

        return response()->json($opnames);
    }

    public function show(Request $request, int $id)
    {
        $opname = KulinerIngredientOpname::with('items.ingredient', 'user', 'approver')
            ->where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        return response()->json($opname);
    }

    public function store(Request $request)
    {
        try {
            return response()->json($this->service->start($request->note), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function update(Request $request, int $id)
    {
        $opname = KulinerIngredientOpname::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        try {
            return response()->json($this->service->updateCounts($opname, $request->input('items', [])));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function submit(Request $request, int $id)
    {
        $opname = KulinerIngredientOpname::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        try {
            return response()->json($this->service->submitForApproval($opname));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function approve(Request $request, int $id)
    {
        $opname = KulinerIngredientOpname::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        try {
            return response()->json($this->service->approve($opname));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, int $id)
    {
        $opname = KulinerIngredientOpname::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        try {
            return response()->json($this->service->reject($opname, $request->note));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $opname = KulinerIngredientOpname::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        if ($opname->status === 'approved') {
            return response()->json(['message' => 'Stock opname yang sudah disetujui tidak dapat dihapus.'], 422);
        }
        $opname->delete();

        return response()->json(['message' => 'Stock opname dihapus']);
    }
}
