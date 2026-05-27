<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminFinanceController extends Controller
{
    /**
     * GET /admin/finance/invoices
     * List all tenant invoices with tenant info.
     */
    public function index(Request $request)
    {
        $query = TenantInvoice::with('tenant:tenant_id,name,business_name')
            ->orderByDesc('date');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('id', 'like', "%{$q}%")
                   ->orWhereHas('tenant', fn($t) => $t->where('name', 'like', "%{$q}%")
                                                        ->orWhere('business_name', 'like', "%{$q}%"));
            });
        }

        $invoices = $query->get()->map(function ($inv) {
            return [
                'id'     => $inv->id,
                'tenant' => $inv->tenant?->business_name ?? $inv->tenant?->name ?? '—',
                'plan'   => $inv->plan,
                'amount' => (float) $inv->amount,
                'status' => $inv->status,
                'date'   => $inv->date?->toDateString(),
                'due'    => $inv->due_date?->toDateString(),
            ];
        });

        return response()->json(['success' => true, 'data' => $invoices]);
    }

    /**
     * GET /admin/finance/stats
     * Monthly aggregated revenue chart data.
     */
    public function stats()
    {
        // Last 6 months grouped by month
        $months = TenantInvoice::select(
                DB::raw("DATE_FORMAT(date, '%b %Y') as month"),
                DB::raw("DATE_FORMAT(date, '%Y-%m') as sort_key"),
                DB::raw('SUM(CASE WHEN status = "paid" THEN amount ELSE 0 END) as revenue'),
                DB::raw('COUNT(CASE WHEN status = "paid" THEN 1 END) as paid'),
                DB::raw('COUNT(CASE WHEN status != "paid" THEN 1 END) as unpaid')
            )
            ->where('date', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('month', 'sort_key')
            ->orderBy('sort_key')
            ->get();

        $totalRevenue  = TenantInvoice::where('status', 'paid')->sum('amount');
        $paidCount     = TenantInvoice::where('status', 'paid')->count();
        $unpaidCount   = TenantInvoice::where('status', '!=', 'paid')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'months'        => $months,
                'total_revenue' => (float) $totalRevenue,
                'paid_count'    => $paidCount,
                'unpaid_count'  => $unpaidCount,
            ]
        ]);
    }

    /**
     * PATCH /admin/finance/invoices/{id}/pay
     * Mark an invoice as paid.
     */
    public function markPaid(string $id)
    {
        $invoice = TenantInvoice::findOrFail($id);

        if ($invoice->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Invoice sudah lunas'], 422);
        }

        $invoice->update(['status' => 'paid', 'paid_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Invoice ditandai lunas', 'data' => $invoice]);
    }

    /**
     * POST /admin/finance/invoices
     * Create a new invoice (manual).
     */
    public function store(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|string|exists:tenants,tenant_id',
            'plan'      => 'required|string',
            'amount'    => 'required|numeric|min:0',
            'date'      => 'required|date',
            'due_date'  => 'required|date',
        ]);

        $invoice = TenantInvoice::create([
            'id'       => TenantInvoice::generateId(),
            'tenant_id'=> $request->tenant_id,
            'plan'     => $request->plan,
            'amount'   => $request->amount,
            'status'   => 'unpaid',
            'date'     => $request->date,
            'due_date' => $request->due_date,
        ]);

        return response()->json(['success' => true, 'data' => $invoice], 201);
    }
}
