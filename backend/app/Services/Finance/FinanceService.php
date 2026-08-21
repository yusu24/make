<?php

namespace App\Services\Finance;

use App\Models\FinancialIncome;
use App\Models\FinancialExpense;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransfer;
use Illuminate\Support\Facades\DB;
use Exception;

class FinanceService
{
    protected $journalService;

    public function __construct(JournalService $journalService)
    {
        $this->journalService = $journalService;
    }

    /**
     * Post an Income to a Financial Transaction.
     */
    public function postIncome(FinancialIncome $income): FinancialTransaction
    {
        if ($income->status !== 'draft') {
            throw new Exception("Only draft income can be posted.");
        }

        DB::beginTransaction();
        try {
            // Update status
            $income->status = 'posted';
            $income->save();

            // Create financial transaction
            $transaction = FinancialTransaction::create([
                'tenant_id' => $income->tenant_id,
                'transaction_number' => 'FT-INC-' . time() . rand(100, 999),
                'type' => 'income',
                'date' => $income->date,
                'amount' => $income->amount,
                'description' => $income->description ?? "Income: {$income->income_number}",
                'source_module' => $income->source_module ?? 'core_finance',
                'source_type' => 'financial_income',
                'source_id' => $income->id,
                'status' => 'posted',
                'created_by' => auth()->id(),
            ]);

            // Adjust account balance
            $income->account->opening_balance += $income->amount;
            $income->account->save();

            // Create Journal Entry
            // Debit: Cash/Bank Account, Credit: Revenue Account
            // We use the income category's parent or a system revenue account if available.
            // For simplicity, we just use the income category_id as the credit account (if categories mapped to accounts, otherwise we'd use a real COA mapping).
            // NOTE: In a full system, category_id would map to a specific COA. Here we just use a placeholder logic.
            $this->journalService->createFromTransaction($transaction, [
                [
                    'account_id' => $income->account_id, // DEBIT the Cash/Bank
                    'debit' => $income->amount,
                    'credit' => 0,
                    'description' => 'Receive Income: ' . $income->description
                ],
                [
                    'account_id' => $income->account_id, // In a real scenario, this should be the Income/Revenue Account mapped to the category
                    'debit' => 0,
                    'credit' => $income->amount,
                    'description' => 'Revenue: ' . $income->category->name
                ]
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Post an Expense to a Financial Transaction.
     */
    public function postExpense(FinancialExpense $expense): FinancialTransaction
    {
        if ($expense->status !== 'draft') {
            throw new Exception("Only draft expense can be posted.");
        }

        DB::beginTransaction();
        try {
            $expense->status = 'posted';
            $expense->save();

            $transaction = FinancialTransaction::create([
                'tenant_id' => $expense->tenant_id,
                'transaction_number' => 'FT-EXP-' . time() . rand(100, 999),
                'type' => 'expense',
                'date' => $expense->date,
                'amount' => $expense->amount,
                'description' => $expense->description ?? "Expense: {$expense->expense_number}",
                'source_module' => $expense->source_module ?? 'core_finance',
                'source_type' => 'financial_expense',
                'source_id' => $expense->id,
                'status' => 'posted',
                'created_by' => auth()->id(),
            ]);

            // Adjust account balance (expense reduces balance)
            $expense->account->opening_balance -= $expense->amount;
            $expense->account->save();

            // Create Journal Entry
            // Debit: Expense Account, Credit: Cash/Bank Account
            $this->journalService->createFromTransaction($transaction, [
                [
                    'account_id' => $expense->account_id, // DEBIT Expense (placeholder mapped account)
                    'debit' => $expense->amount,
                    'credit' => 0,
                    'description' => 'Expense: ' . $expense->category->name
                ],
                [
                    'account_id' => $expense->account_id, // CREDIT Cash/Bank
                    'debit' => 0,
                    'credit' => $expense->amount,
                    'description' => 'Pay Expense: ' . $expense->description
                ]
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Post a Transfer to a Financial Transaction.
     */
    public function postTransfer(FinancialTransfer $transfer): FinancialTransaction
    {
        if ($transfer->status !== 'draft') {
            throw new Exception("Only draft transfers can be posted.");
        }

        DB::beginTransaction();
        try {
            $transfer->status = 'posted';
            $transfer->save();

            $transaction = FinancialTransaction::create([
                'tenant_id' => $transfer->tenant_id,
                'transaction_number' => 'FT-TRF-' . time() . rand(100, 999),
                'type' => 'transfer',
                'date' => $transfer->date,
                'amount' => $transfer->amount,
                'description' => $transfer->description ?? "Transfer from {$transfer->fromAccount->name} to {$transfer->toAccount->name}",
                'source_module' => 'core_finance',
                'source_type' => 'financial_transfer',
                'source_id' => $transfer->id,
                'status' => 'posted',
                'created_by' => auth()->id(),
            ]);

            // Adjust account balances
            $transfer->fromAccount->opening_balance -= $transfer->amount;
            $transfer->fromAccount->save();

            $transfer->toAccount->opening_balance += $transfer->amount;
            $transfer->toAccount->save();

            // Create Journal Entry
            $this->journalService->createFromTransaction($transaction, [
                [
                    'account_id' => $transfer->toAccount->id, // DEBIT target bank
                    'debit' => $transfer->amount,
                    'credit' => 0,
                    'description' => 'Transfer in from ' . $transfer->fromAccount->name
                ],
                [
                    'account_id' => $transfer->fromAccount->id, // CREDIT source bank
                    'debit' => 0,
                    'credit' => $transfer->amount,
                    'description' => 'Transfer out to ' . $transfer->toAccount->name
                ]
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Post a Receivable Payment to a Financial Transaction.
     */
    public function postReceivablePayment(\App\Models\FinancialReceivablePayment $payment): FinancialTransaction
    {
        DB::beginTransaction();
        try {
            $transaction = FinancialTransaction::create([
                'tenant_id' => $payment->receivable->tenant_id,
                'transaction_number' => 'FT-RVP-' . time() . rand(100, 999),
                'type' => 'income',
                'date' => $payment->payment_date,
                'amount' => $payment->amount,
                'description' => $payment->notes ?? "Payment for Receivable {$payment->receivable->invoice_number}",
                'source_module' => 'core_finance',
                'source_type' => 'financial_receivable_payment',
                'source_id' => $payment->id,
                'status' => 'posted',
                'created_by' => auth()->id(),
            ]);

            // Adjust account balance (Receivable payment is money in -> adds balance)
            $payment->account->opening_balance += $payment->amount;
            $payment->account->save();

            // Create Journal Entry
            $this->journalService->createFromTransaction($transaction, [
                [
                    'account_id' => $payment->account_id, // DEBIT Cash/Bank
                    'debit' => $payment->amount,
                    'credit' => 0,
                    'description' => 'Payment received for ' . $payment->receivable->invoice_number
                ],
                [
                    'account_id' => $payment->account_id, // CREDIT Accounts Receivable (placeholder mapping)
                    'debit' => 0,
                    'credit' => $payment->amount,
                    'description' => 'Reduce Receivable'
                ]
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Post a Payable Payment to a Financial Transaction.
     */
    public function postPayablePayment(\App\Models\FinancialPayablePayment $payment): FinancialTransaction
    {
        DB::beginTransaction();
        try {
            $transaction = FinancialTransaction::create([
                'tenant_id' => $payment->payable->tenant_id,
                'transaction_number' => 'FT-PYP-' . time() . rand(100, 999),
                'type' => 'expense',
                'date' => $payment->payment_date,
                'amount' => $payment->amount,
                'description' => $payment->notes ?? "Payment for Payable {$payment->payable->invoice_number}",
                'source_module' => 'core_finance',
                'source_type' => 'financial_payable_payment',
                'source_id' => $payment->id,
                'status' => 'posted',
                'created_by' => auth()->id(),
            ]);

            // Adjust account balance (Payable payment is money out -> subtracts balance)
            $payment->account->opening_balance -= $payment->amount;
            $payment->account->save();

            // Create Journal Entry
            $this->journalService->createFromTransaction($transaction, [
                [
                    'account_id' => $payment->account_id, // DEBIT Accounts Payable (placeholder)
                    'debit' => $payment->amount,
                    'credit' => 0,
                    'description' => 'Reduce Payable for ' . $payment->payable->invoice_number
                ],
                [
                    'account_id' => $payment->account_id, // CREDIT Cash/Bank
                    'debit' => 0,
                    'credit' => $payment->amount,
                    'description' => 'Payment sent'
                ]
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
