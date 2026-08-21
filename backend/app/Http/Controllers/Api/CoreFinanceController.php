<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialIncome;
use App\Models\FinancialExpense;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransfer;
use App\Services\Finance\FinanceService;

class CoreFinanceController extends Controller
{
    protected $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    public function getAccounts(Request $request)
    {
        $accounts = FinancialAccount::all();
        return response()->json(['success' => true, 'data' => $accounts]);
    }

    public function storeAccount(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,bank,ewallet,qris,other',
            'currency' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        $account = FinancialAccount::create($validated);
        return response()->json(['success' => true, 'message' => 'Account created successfully', 'data' => $account]);
    }

    public function getCategories(Request $request)
    {
        $categories = FinancialCategory::all();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function getIncomes(Request $request)
    {
        $incomes = FinancialIncome::with(['account', 'category'])->get();
        return response()->json(['success' => true, 'data' => $incomes]);
    }

    public function storeIncome(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'account_id' => 'required|exists:financial_accounts,id',
            'category_id' => 'required|exists:financial_categories,id',
            'description' => 'nullable|string',
        ]);

        $validated['income_number'] = 'INC-' . time();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'draft';

        $income = FinancialIncome::create($validated);
        return response()->json(['success' => true, 'message' => 'Income created in draft', 'data' => $income]);
    }

    public function postIncome($id)
    {
        $income = FinancialIncome::findOrFail($id);
        $transaction = $this->financeService->postIncome($income);
        return response()->json(['success' => true, 'message' => 'Income posted successfully', 'data' => $transaction]);
    }

    public function getExpenses(Request $request)
    {
        $expenses = FinancialExpense::with(['account', 'category'])->get();
        return response()->json(['success' => true, 'data' => $expenses]);
    }

    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'account_id' => 'required|exists:financial_accounts,id',
            'category_id' => 'required|exists:financial_categories,id',
            'description' => 'nullable|string',
        ]);

        $validated['expense_number'] = 'EXP-' . time();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'draft';

        $expense = FinancialExpense::create($validated);
        return response()->json(['success' => true, 'message' => 'Expense created in draft', 'data' => $expense]);
    }

    public function postExpense($id)
    {
        $expense = FinancialExpense::findOrFail($id);
        $transaction = $this->financeService->postExpense($expense);
        return response()->json(['success' => true, 'message' => 'Expense posted successfully', 'data' => $transaction]);
    }

    public function getTransfers(Request $request)
    {
        $transfers = FinancialTransfer::with(['fromAccount', 'toAccount'])->get();
        return response()->json(['success' => true, 'data' => $transfers]);
    }

    public function storeTransfer(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'from_account_id' => 'required|exists:financial_accounts,id',
            'to_account_id' => 'required|exists:financial_accounts,id|different:from_account_id',
            'description' => 'nullable|string',
        ]);

        $validated['transfer_number'] = 'TRF-' . time();
        $validated['created_by'] = auth()->id();
        $validated['status'] = 'draft';

        $transfer = FinancialTransfer::create($validated);
        return response()->json(['success' => true, 'message' => 'Transfer created in draft', 'data' => $transfer]);
    }

    public function postTransfer($id)
    {
        $transfer = FinancialTransfer::findOrFail($id);
        $transaction = $this->financeService->postTransfer($transfer);
        return response()->json(['success' => true, 'message' => 'Transfer posted successfully', 'data' => $transaction]);
    }
}
