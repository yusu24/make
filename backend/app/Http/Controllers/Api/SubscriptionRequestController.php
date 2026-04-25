<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionRequest;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class SubscriptionRequestController extends Controller
{
    /**
     * List all pending requests for Super Admin
     */
    public function index(Request $request)
    {
        // Only Super Admin should access this
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = SubscriptionRequest::with('tenant')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $requests]);
    }

    /**
     * Tenant submits a new upgrade request
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Hanya Pemilik Toko yang bisa mengajukan upgrade'], 403);
        }

        $tenantId = $user->tenant_id;

        // Check if there's already a pending request
        $existing = SubscriptionRequest::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Anda sudah memiliki permintaan upgrade yang sedang diproses.'], 422);
        }

        $req = SubscriptionRequest::create([
            'tenant_id' => $tenantId,
            'plan' => $request->plan,
            'notes' => $request->notes,
            'status' => 'pending'
        ]);

        // Notify Super Admins
        $admins = \App\Models\User::where('role', 'super_admin')->get();
        foreach ($admins as $adm) {
            \App\Models\Notification::create([
                'user_id' => $adm->id,
                'type' => 'info',
                'title' => 'Permintaan Langganan Baru',
                'message' => "Tenant " . ($user->name) . " mengajukan upgrade ke paket " . strtoupper($request->plan),
                'data' => ['link' => '/tenants', 'request_id' => $req->id]
            ]);
        }

        return response()->json($req);
    }

    /**
     * Get current pending request for the logged in tenant
     */
    public function current(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $req = SubscriptionRequest::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->first();

        return response()->json(['data' => $req]);
    }

    /**
     * Admin approves a request
     */
    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return DB::transaction(function () use ($id) {
            $subReq = SubscriptionRequest::findOrFail($id);
            
            if ($subReq->status !== 'pending') {
                return response()->json(['message' => 'Permintaan sudah diproses sebelumnya'], 422);
            }

            // Update Tenant Plan
            $tenant = Tenant::where('tenant_id', $subReq->tenant_id)->first();
            if ($tenant) {
                $tenant->update(['subscription_plan' => strtolower($subReq->plan)]);
                
                // Notify Tenant Owner
                \App\Models\Notification::create([
                    'user_id' => $tenant->user_id,
                    'type' => 'success',
                    'title' => 'Langganan Diaktifkan! 🎉',
                    'message' => "Permintaan upgrade Anda ke paket " . strtoupper($subReq->plan) . " telah disetujui.",
                    'data' => ['link' => '/retail/subscription']
                ]);
            }

            // Mark request as approved
            $subReq->update(['status' => 'approved']);

            return response()->json(['message' => 'Langganan berhasil diaktifkan!']);
        });
    }

    /**
     * Admin rejects a request
     */
    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subReq = SubscriptionRequest::findOrFail($id);

        $subReq->update([
            'status' => 'rejected',
            'notes' => $request->notes ?? 'Ditolak oleh admin'
        ]);

        // Notify Tenant Owner
        $tenant = Tenant::where('tenant_id', $subReq->tenant_id)->first();
        if ($tenant) {
            \App\Models\Notification::create([
                'user_id' => $tenant->user_id,
                'type' => 'danger',
                'title' => 'Permintaan Langganan Ditolak',
                'message' => "Mohon maaf, permintaan upgrade Anda ditolak. Alasan: " . ($request->notes ?? 'Data tidak valid'),
                'data' => ['link' => '/retail/subscription']
            ]);
        }

        return response()->json(['message' => 'Permintaan ditolak']);
    }
}
