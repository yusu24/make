<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailReceivable;
use App\Models\RetailReceivablePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RetailReceivableController extends Controller
{
    public function index(Request $request)
    {
        $receivables = RetailReceivable::with(['customer', 'payments'])->latest()->get();

        return response()->json([
            'data' => $receivables,
            'summary' => [
                'total_credit' => $receivables->sum('total_amount'),
                'total_paid' => $receivables->sum('paid_amount'),
                'total_outstanding' => $receivables->sum(fn ($r) => $r->remaining),
                'count_unpaid' => $receivables->where('status', '!=', 'paid')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|integer|exists:retail_customers,id',
            'transaction_id' => 'nullable|integer|exists:retail_transactions,id',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date',
            'note' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $receivable = RetailReceivable::create($request->only([
            'customer_id', 'transaction_id', 'total_amount', 'due_date', 'note',
        ]));
        return response()->json($receivable, 201);
    }

    public function recordPayment(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'amount_paid' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:255',
            'paid_at' => 'nullable|date',
            'note' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $receivable = RetailReceivable::findOrFail($id);

        if ($request->amount_paid > $receivable->remaining) {
            return response()->json(['message' => 'Jumlah pembayaran melebihi sisa piutang.'], 422);
        }

        $payment = RetailReceivablePayment::create([
            'receivable_id' => $receivable->id,
            'user_id' => $request->user()->id,
            'amount_paid' => $request->amount_paid,
            'payment_method' => $request->payment_method,
            'paid_at' => $request->paid_at ?? now(),
            'note' => $request->note,
        ]);

        return response()->json(['data' => $payment, 'receivable' => $receivable->fresh(['payments'])]);
    }

    public function destroy(Request $request, int $id)
    {
        RetailReceivable::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
