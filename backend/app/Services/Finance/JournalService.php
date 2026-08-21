<?php

namespace App\Services\Finance;

use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\FinancialTransaction;
use App\Models\FinancialPeriod;
use Illuminate\Support\Facades\DB;
use Exception;

class JournalService
{
    /**
     * Create a double-entry journal from a Financial Transaction.
     */
    public function createFromTransaction(FinancialTransaction $transaction, array $lines)
    {
        // 1. Check if period is closed
        $this->checkPeriodOpen($transaction->date);

        // 2. Validate Double Entry
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($lines as $line) {
            $totalDebit += isset($line['debit']) ? $line['debit'] : 0;
            $totalCredit += isset($line['credit']) ? $line['credit'] : 0;
        }

        // Float comparison precision check
        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw new Exception("Journal entry imbalance. Total Debit: $totalDebit, Total Credit: $totalCredit");
        }

        DB::beginTransaction();
        try {
            $entry = JournalEntry::create([
                'tenant_id' => $transaction->tenant_id,
                'date' => $transaction->date,
                'reference_no' => $transaction->transaction_number,
                'description' => $transaction->description,
                'module_source' => $transaction->source_module,
            ]);

            foreach ($lines as $line) {
                JournalLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $line['account_id'],
                    'debit' => isset($line['debit']) ? $line['debit'] : 0,
                    'credit' => isset($line['credit']) ? $line['credit'] : 0,
                    'description' => $line['description'] ?? null,
                ]);
            }

            DB::commit();
            return $entry;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Ensure the financial period for a given date is not closed.
     */
    public function checkPeriodOpen($date)
    {
        // Date could be carbon or string
        $parsedDate = \Carbon\Carbon::parse($date);
        $periodName = $parsedDate->format('Y-m');

        $period = FinancialPeriod::where('tenant_id', auth()->user()->tenant_id ?? request()->header('X-Tenant'))
            ->where('period_name', $periodName)
            ->first();

        if ($period && $period->status === 'closed') {
            throw new Exception("Financial period {$periodName} is already closed. Transactions cannot be posted/modified.");
        }
    }
}
