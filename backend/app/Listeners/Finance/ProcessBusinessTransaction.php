<?php

namespace App\Listeners\Finance;

use App\Events\Finance\BusinessTransactionPosted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\FinancialTransaction;
use App\Models\FinancialAccount;
use App\Services\Finance\JournalService;
use Illuminate\Support\Facades\DB;
use Exception;

class ProcessBusinessTransaction
{
    protected $journalService;

    /**
     * Create the event listener.
     */
    public function __construct(JournalService $journalService)
    {
        $this->journalService = $journalService;
    }

    /**
     * Handle the event.
     */
    public function handle(BusinessTransactionPosted $event): void
    {
        DB::beginTransaction();
        try {
            $transactionNumber = 'FT-' . strtoupper(substr($event->sourceModule, 0, 3)) . '-' . time() . rand(100, 999);

            $transaction = FinancialTransaction::create([
                'tenant_id' => $event->tenantId,
                'transaction_number' => $transactionNumber,
                'type' => $event->type,
                'date' => $event->date,
                'amount' => $event->amount,
                'description' => $event->description,
                'source_module' => $event->sourceModule,
                'source_type' => $event->sourceType,
                'source_id' => $event->sourceId,
                'status' => 'posted',
            ]);

            $account = FinancialAccount::find($event->accountId);
            
            if ($account) {
                if ($event->type === 'income') {
                    $account->opening_balance += $event->amount;
                    $account->save();
                    
                    // Create Journal Entry
                    $this->journalService->createFromTransaction($transaction, [
                        [
                            'account_id' => $account->id, // DEBIT Cash
                            'debit' => $event->amount,
                            'credit' => 0,
                            'description' => 'Received from ' . $event->sourceModule
                        ],
                        [
                            'account_id' => $account->id, // CREDIT Revenue (placeholder)
                            'debit' => 0,
                            'credit' => $event->amount,
                            'description' => 'Revenue ' . $event->sourceModule
                        ]
                    ]);
                } else {
                    $account->opening_balance -= $event->amount;
                    $account->save();
                    
                    // Create Journal Entry
                    $this->journalService->createFromTransaction($transaction, [
                        [
                            'account_id' => $account->id, // DEBIT Expense (placeholder)
                            'debit' => $event->amount,
                            'credit' => 0,
                            'description' => 'Expense ' . $event->sourceModule
                        ],
                        [
                            'account_id' => $account->id, // CREDIT Cash
                            'debit' => 0,
                            'credit' => $event->amount,
                            'description' => 'Payment for ' . $event->sourceModule
                        ]
                    ]);
                }
            }

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            // Log the error in a real scenario
            \Log::error('Failed processing business transaction: ' . $e->getMessage());
        }
    }
}
