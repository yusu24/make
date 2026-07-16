<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailCustomerReturn;
use App\Models\RetailTransaction;
use App\Services\Retail\RetailReturnService;
use Illuminate\Http\Request;

class RetailCustomerReturnController extends Controller
{
    public function __construct(private RetailReturnService $returns) {}

    public function index(Request $request)
    {
        return response()->json(RetailCustomerReturn::with(['customer', 'transaction', 'items'])->latest()->get());
    }

    public function orderDetails(Request $request, int $transactionId)
    {
        $transaction = RetailTransaction::with(['items.product', 'customer'])->findOrFail($transactionId);
        return response()->json($transaction);
    }

    public function store(Request $request)
    {
        try {
            $return = $this->returns->createCustomerReturn($request->all());
            return response()->json($return, 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function confirm(Request $request, int $id)
    {
        try {
            $return = RetailCustomerReturn::findOrFail($id);
            return response()->json($this->returns->confirmCustomerReturn($return));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $return = RetailCustomerReturn::findOrFail($id);
        if ($return->status === 'confirmed') {
            return response()->json(['message' => 'Retur yang sudah dikonfirmasi tidak dapat dihapus.'], 422);
        }
        $return->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
