<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailPayable;
use App\Models\RetailPayablePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RetailPayableController extends Controller
{
    public function index(Request $request)
    {
        $payables = RetailPayable::with(['supplier', 'payments'])->latest()->get();

        return response()->json([
            'data' => $payables,
            'summary' => [
                'total_debt' => $payables->sum('total_amount'),
                'total_paid' => $payables->sum('paid_amount'),
                'total_outstanding' => $payables->sum(fn ($p) => $p->remaining),
                'count_unpaid' => $payables->where('status', '!=', 'paid')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|integer|exists:retail_suppliers,id',
            'purchase_id' => 'nullable|integer|exists:retail_purchases,id',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date',
            'note' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payable = RetailPayable::create($request->only([
            'supplier_id', 'purchase_id', 'total_amount', 'due_date', 'note',
        ]));
        return response()->json($payable, 201);
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

        $payable = RetailPayable::findOrFail($id);

        if ($request->amount_paid > $payable->remaining) {
            return response()->json(['message' => 'Jumlah pembayaran melebihi sisa hutang.'], 422);
        }

        $payment = RetailPayablePayment::create([
            'payable_id' => $payable->id,
            'user_id' => $request->user()->id,
            'amount_paid' => $request->amount_paid,
            'payment_method' => $request->payment_method,
            'paid_at' => $request->paid_at ?? now(),
            'note' => $request->note,
        ]);

        return response()->json(['data' => $payment, 'payable' => $payable->fresh(['payments'])]);
    }

    public function destroy(Request $request, int $id)
    {
        RetailPayable::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
