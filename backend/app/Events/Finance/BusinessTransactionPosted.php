<?php

namespace App\Events\Finance;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BusinessTransactionPosted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tenantId;
    public $type; // 'income' or 'expense'
    public $amount;
    public $sourceModule; // 'retail', 'kuliner', 'budidaya'
    public $sourceType; // e.g. 'retail_transaction', 'kuliner_order'
    public $sourceId;
    public $description;
    public $accountId; // The cash/bank account ID
    public $date;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($tenantId, $type, $amount, $sourceModule, $sourceType, $sourceId, $description, $accountId, $date = null)
    {
        $this->tenantId = $tenantId;
        $this->type = $type;
        $this->amount = $amount;
        $this->sourceModule = $sourceModule;
        $this->sourceType = $sourceType;
        $this->sourceId = $sourceId;
        $this->description = $description;
        $this->accountId = $accountId;
        $this->date = $date ?? now();
    }
}
