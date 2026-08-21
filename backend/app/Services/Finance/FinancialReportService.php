<?php

namespace App\Services\Finance;

use App\Models\FinancialTransaction;
use App\Models\FinancialAccount;
use Illuminate\Support\Facades\DB;

class FinancialReportService
{
    /**
     * Get Profit & Loss data for a date range.
     */
    public function getProfitAndLoss($startDate, $endDate, $tenantId)
    {
        $incomes = FinancialTransaction::where('tenant_id', $tenantId)
            ->where('type', 'income')
            ->where('status', 'posted')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $expenses = FinancialTransaction::where('tenant_id', $tenantId)
            ->where('type', 'expense')
            ->where('status', 'posted')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        return [
            'total_income' => $incomes,
            'total_expense' => $expenses,
            'net_profit' => $incomes - $expenses,
        ];
    }

    /**
     * Get Cash Flow Summary (Account Balances).
     */
    public function getCashFlowSummary($tenantId)
    {
        $accounts = FinancialAccount::where('tenant_id', $tenantId)
            ->whereIn('type', ['cash', 'bank', 'ewallet', 'qris'])
            ->get(['id', 'name', 'type', 'opening_balance', 'currency']);

        $totalCash = $accounts->sum('opening_balance');

        return [
            'accounts' => $accounts,
            'total_cash_and_bank' => $totalCash,
        ];
    }
}
