<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RetailTransaction;
use App\Services\Retail\RetailOrderService;

class RetailTransactionController extends Controller {
    public function __construct(private RetailOrderService $orders) {}

    public function index(Request $request) {
        $query = RetailTransaction::with(['customer', 'items'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('startDate') && $request->filled('endDate')) {
            $query->whereBetween('created_at', [$request->startDate . ' 00:00:00', $request->endDate . ' 23:59:59']);
        }
        if ($request->filled('search')) {
            $query->where('invoice_no', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(20));
    }

    public function show(Request $request, int $id) {
        $transaction = RetailTransaction::with(['customer', 'items.product', 'discount', 'user'])->findOrFail($id);
        return response()->json($transaction);
    }

    public function store(Request $request) {
        try {
            $transaction = $this->orders->checkout($request->all(), $request->user());
            return response()->json($transaction);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function void(Request $request, int $id) {
        try {
            $transaction = RetailTransaction::findOrFail($id);
            $transaction = $this->orders->void($transaction, $request->user(), $request->reason);
            return response()->json($transaction);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
