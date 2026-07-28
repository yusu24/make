<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TenantInvoice;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class CheckOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for unpaid invoices past their due date, mark them overdue, and notify admins and tenants';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $overdueInvoices = TenantInvoice::with('tenant')
            ->where('status', 'unpaid')
            ->whereDate('due_date', '<', Carbon::today())
            ->get();

        if ($overdueInvoices->isEmpty()) {
            $this->info('No overdue invoices found.');
            return;
        }

        $admins = User::where('role', 'super_admin')->get();

        foreach ($overdueInvoices as $invoice) {
            // Update status to overdue
            $invoice->update(['status' => 'overdue']);

            $tenantName = $invoice->tenant ? $invoice->tenant->name : 'Unknown Tenant';

            // 1. Notify SaaS Admins
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'danger',
                    'title' => 'Tagihan Penunggakan (Overdue)',
                    'message' => "Tenant {$tenantName} terlambat membayar tagihan {$invoice->id} sebesar Rp" . number_format($invoice->amount, 0, ',', '.'),
                    'data' => ['link' => '/subscriptions', 'invoice_id' => $invoice->id]
                ]);
            }

            // 2. Notify Tenant Owner
            if ($invoice->tenant && $invoice->tenant->user_id) {
                Notification::create([
                    'user_id' => $invoice->tenant->user_id,
                    'type' => 'danger',
                    'title' => 'Tagihan Anda Jatuh Tempo!',
                    'message' => "Tagihan {$invoice->id} sebesar Rp" . number_format($invoice->amount, 0, ',', '.') . " sudah melewati batas waktu pembayaran.",
                    'data' => ['link' => '/retail/subscription', 'invoice_id' => $invoice->id]
                ]);
            }
        }

        $this->info("Successfully marked {$overdueInvoices->count()} invoices as overdue and sent notifications.");
    }
}
