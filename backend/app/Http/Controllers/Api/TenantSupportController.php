<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;

class TenantSupportController extends Controller
{
    /**
     * GET /support/tickets
     * List all support tickets for the authenticated tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant ID not found'], 400);
        }

        $query = SupportTicket::where('tenant_id', $tenantId)
            ->orderByDesc('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('id', 'like', "%{$q}%")
                   ->orWhere('subject', 'like', "%{$q}%");
            });
        }

        $tickets = $query->get()->map(function ($t) {
            return [
                'id'       => $t->id,
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
     * POST /support/tickets
     * Create a new support ticket as a tenant.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant ID not found'], 400);
        }

        $request->validate([
            'subject'     => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|string|in:bug,question,feature,billing',
            'priority'    => 'required|string|in:high,medium,low',
        ]);

        $ticket = SupportTicket::create([
            'id'          => SupportTicket::generateId(),
            'tenant_id'   => $tenantId,
            'name'        => $user->name,
            'subject'     => $request->subject,
            'description' => $request->description,
            'category'    => $request->category,
            'priority'    => $request->priority,
            'status'      => 'open',
            'assigned'    => null,
        ]);

        return response()->json(['success' => true, 'data' => $ticket, 'message' => 'Tiket berhasil dibuat.'], 201);
    }
}
