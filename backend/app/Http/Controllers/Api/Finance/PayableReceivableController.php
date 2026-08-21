<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FinancialReceivable;
use App\Models\FinancialReceivablePayment;
use App\Models\FinancialPayable;
use App\Models\FinancialPayablePayment;
use App\Services\Finance\FinanceService;

class PayableReceivableController extends Controller
{
    protected $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    // --- RECEIVABLES ---

    public function getReceivables(Request $request)
    {
        $receivables = FinancialReceivable::with('payments')->get();
        return response()->json(['success' => true, 'data' => $receivables]);
    }

    public function storeReceivable(Request $request)
    {
        $validated = $request->validate([
            'due_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0',
            'customer_id' => 'nullable|integer',
            'description' => 'nullable|string',
        ]);

        $validated['invoice_number'] = 'INV-REC-' . time();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'unpaid';

        $receivable = FinancialReceivable::create($validated);
        return response()->json(['success' => true, 'message' => 'Receivable created', 'data' => $receivable]);
    }

    public function storeReceivablePayment(Request $request, $id)
    {
        $receivable = FinancialReceivable::findOrFail($id);

        $validated = $request->validate([
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01|max:' . $receivable->remaining_amount,
            'account_id' => 'required|exists:financial_accounts,id',
            'notes' => 'nullable|string',
        ]);

        $validated['receivable_id'] = $receivable->id;
        $validated['created_by'] = auth()->id();

        $payment = FinancialReceivablePayment::create($validated);

        // Update receivable paid amount & status
        $receivable->paid_amount += $payment->amount;
        if ($receivable->paid_amount >= $receivable->total_amount) {
            $receivable->status = 'paid';
        } else {
            $receivable->status = 'partial';
        }
        $receivable->save();

        // Post to financial transactions
        $transaction = $this->financeService->postReceivablePayment($payment);

        return response()->json([
            'success' => true, 
            'message' => 'Payment recorded successfully', 
            'data' => [
                'payment' => $payment,
                'transaction' => $transaction
            ]
        ]);
    }

    // --- PAYABLES ---

    public function getPayables(Request $request)
    {
        $payables = FinancialPayable::with('payments')->get();
        return response()->json(['success' => true, 'data' => $payables]);
    }

    public function storePayable(Request $request)
    {
        $validated = $request->validate([
            'due_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|integer',
            'description' => 'nullable|string',
        ]);

        $validated['invoice_number'] = 'INV-PAY-' . time();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'unpaid';

        $payable = FinancialPayable::create($validated);
        return response()->json(['success' => true, 'message' => 'Payable created', 'data' => $payable]);
    }

    public function storePayablePayment(Request $request, $id)
    {
        $payable = FinancialPayable::findOrFail($id);

        $validated = $request->validate([
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01|max:' . $payable->remaining_amount,
            'account_id' => 'required|exists:financial_accounts,id',
            'notes' => 'nullable|string',
        ]);

        $validated['payable_id'] = $payable->id;
        $validated['created_by'] = auth()->id();

        $payment = FinancialPayablePayment::create($validated);

        // Update payable paid amount & status
        $payable->paid_amount += $payment->amount;
        if ($payable->paid_amount >= $payable->total_amount) {
            $payable->status = 'paid';
        } else {
            $payable->status = 'partial';
        }
        $payable->save();

        // Post to financial transactions
        $transaction = $this->financeService->postPayablePayment($payment);

        return response()->json([
            'success' => true, 
            'message' => 'Payment recorded successfully', 
            'data' => [
                'payment' => $payment,
                'transaction' => $transaction
            ]
        ]);
    }
}
