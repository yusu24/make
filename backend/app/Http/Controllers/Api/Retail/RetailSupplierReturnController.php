<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailSupplierReturn;
use App\Services\Retail\RetailReturnService;
use Illuminate\Http\Request;

class RetailSupplierReturnController extends Controller
{
    public function __construct(private RetailReturnService $returns) {}

    public function index(Request $request)
    {
        return response()->json(RetailSupplierReturn::with(['supplier', 'items'])->latest()->get());
    }

    public function store(Request $request)
    {
        try {
            $return = $this->returns->createSupplierReturn($request->all());
            return response()->json($return, 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function confirm(Request $request, int $id)
    {
        try {
            $return = RetailSupplierReturn::findOrFail($id);
            return response()->json($this->returns->confirmSupplierReturn($return));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $return = RetailSupplierReturn::findOrFail($id);
        if ($return->status === 'confirmed') {
            return response()->json(['message' => 'Retur yang sudah dikonfirmasi tidak dapat dihapus.'], 422);
        }
        $return->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
