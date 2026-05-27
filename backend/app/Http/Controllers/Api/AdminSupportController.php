<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;

class AdminSupportController extends Controller
{
    /**
     * GET /admin/support/tickets
     * List all support tickets with tenant info.
     */
    public function index(Request $request)
    {
        $query = SupportTicket::with('tenant:tenant_id,name,business_name')
            ->orderByDesc('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('id', 'like', "%{$q}%")
                   ->orWhere('subject', 'like', "%{$q}%")
                   ->orWhere('name', 'like', "%{$q}%")
                   ->orWhereHas('tenant', fn($t) => $t->where('name', 'like', "%{$q}%")
                                                        ->orWhere('business_name', 'like', "%{$q}%"));
            });
        }

        $tickets = $query->get()->map(function ($t) {
            return [
                'id'       => $t->id,
                'tenant'   => $t->tenant?->business_name ?? $t->tenant?->name ?? $t->name ?? '—',
                'subject'  => $t->subject,
                'description' => $t->description,
                'category' => $t->category,
                'priority' => $t->priority,
                'status'   => $t->status,
                'assigned' => $t->assigned ?? '—',
                'date'     => $t->created_at?->toDateString(),
            ];
        });

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    /**
     * POST /admin/support/tickets
     * Create a new support ticket manually.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tenant_id'   => 'nullable|string|exists:tenants,tenant_id',
            'name'        => 'required_without:tenant_id|nullable|string|max:100',
            'subject'     => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'required|string|in:bug,question,feature,billing',
            'priority'    => 'required|string|in:high,medium,low',
        ]);

        $ticket = SupportTicket::create([
            'id'          => SupportTicket::generateId(),
            'tenant_id'   => $request->tenant_id,
            'name'        => $request->name,
            'subject'     => $request->subject,
            'description' => $request->description,
            'category'    => $request->category,
            'priority'    => $request->priority,
            'status'      => 'open',
            'assigned'    => null,
        ]);

        return response()->json(['success' => true, 'data' => $ticket], 201);
    }

    /**
     * PATCH /admin/support/tickets/{id}/status
     * Update the ticket status (e.g. process or resolve).
     */
    public function updateStatus(Request $request, string $id)
    {
        $ticket = SupportTicket::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved',
        ]);

        $status = $request->status;
        $updateData = ['status' => $status];

        if ($status === 'in_progress') {
            $updateData['assigned'] = 'Admin';
        }

        $ticket->update($updateData);

        return response()->json(['success' => true, 'message' => 'Status tiket diperbarui', 'data' => $ticket]);
    }
}
