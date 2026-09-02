<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionRequest;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

use App\Services\PaymentGatewayService;

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
     * Tenant submits a new upgrade request & generates payment gateway invoice
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Hanya Pemilik Toko yang bisa mengajukan upgrade'], 403);
        }

        $tenantId = $user->tenant_id;
        $tenant = Tenant::where('tenant_id', $tenantId)->firstOrFail();

        $planKey = strtolower($request->plan ?? 'basic');

        if ($planKey === 'free') {
            return response()->json(['message' => 'Paket Free adalah paket dasar gratis dan tidak memerlukan transaksi langganan.'], 422);
        }

        $tierRanks = ['free' => 0, 'basic' => 1, 'pro' => 2, 'enterprise' => 3];
        $currentPlan = strtolower($tenant->subscription_plan ?? 'free');
        $currentRank = $tierRanks[$currentPlan] ?? 0;
        $targetRank = $tierRanks[$planKey] ?? 1;

        if ($currentRank >= $targetRank && $currentPlan !== 'free') {
            return response()->json(['message' => "Akun Anda saat ini sudah berada di paket {$tenant->subscription_plan}. Downgrade tidak didukung secara otomatis."], 422);
        }

        // Determine price
        $planModel = \App\Models\SubscriptionPlan::where('business_category_id', $tenant->business_category_id)
            ->where('plan_key', $planKey)
            ->first();

        $settings = \App\Models\LandingSetting::first();
        $defaultPrice = match ($planKey) {
            'pro'   => (float) ($settings->pricing_pro_monthly ?? 149000),
            'basic' => (float) ($settings->pricing_basic_monthly ?? 49000),
            default => 0
        };

        $amount = (float) ($planModel?->price ?? $defaultPrice);

        // If promo active, apply discount
        if ($tenant->businessCategory && $tenant->businessCategory->promo_active && $tenant->businessCategory->discount_pct > 0) {
            $discountPct = (float) $tenant->businessCategory->discount_pct;
            $amount = max(0, $amount - ($amount * ($discountPct / 100)));
        }

        // Check if there's already a pending request
        $existing = SubscriptionRequest::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            $existing->delete();
        }

        $req = SubscriptionRequest::create([
            'tenant_id' => $tenantId,
            'plan'      => $planKey,
            'notes'     => $request->notes,
            'status'    => 'pending'
        ]);

        // Generate Payment Invoice Session (QRIS & VA)
        $paymentData = PaymentGatewayService::createInvoice($tenant, $planKey, $amount);

        // Send Email Invoice to Customer Email ($user->email)
        try {
            $customerEmail = $user->email;
            if (!empty($customerEmail)) {
                if (!empty($settings?->billing_email)) {
                    config(['mail.from.address' => $settings->billing_email]);
                }
                \Illuminate\Support\Facades\Mail::to($customerEmail)->send(new \App\Mail\SubscriptionInvoiceMail([
                    'customer_name'     => $user->name,
                    'invoice_number'    => $paymentData['invoice_number'] ?? '',
                    'plan'              => ucfirst($planKey),
                    'amount'            => $amount,
                    'due_date'          => $paymentData['due_date'] ?? '',
                    'bank_name'         => $settings->bank_name ?? 'BANK BCA',
                    'bank_account_no'   => $settings->bank_account_no ?? '8837 001 992',
                    'bank_account_name' => $settings->bank_account_name ?? 'PT Antigravity Global SaaS',
                    'billing_email'     => $settings->billing_email ?? 'billing@bizora.id',
                    'support_email'     => $settings->support_email ?? 'bantuan@bizora.id',
                ]));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal mengirim email invoice langganan: ' . $e->getMessage());
        }

        // Notify Super Admins
        $admins = \App\Models\User::where('role', 'super_admin')->get();
        foreach ($admins as $adm) {
            \App\Models\Notification::create([
                'user_id' => $adm->id,
                'type'    => 'info',
                'title'   => 'Permintaan Langganan Baru',
                'message' => "Tenant " . ($user->name) . " mengajukan upgrade ke paket " . strtoupper($planKey),
                'data'    => ['link' => '/tenants', 'request_id' => $req->id]
            ]);
        }

        return response()->json([
            'success'      => true,
            'request'      => $req,
            'payment_data' => $paymentData,
        ]);
    }

    /**
     * Get current pending request for the logged in tenant
     */
    public function current(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;
        
        $req = SubscriptionRequest::where('tenant_id', $tenantId)
            ->where('status', 'pending')
            ->first();

        // Fetch tenant with business category to retrieve active promo packages
        $tenant = Tenant::where('tenant_id', $tenantId)->with('businessCategory')->first();
        
        $promo = null;
        if ($tenant && $tenant->businessCategory && $tenant->businessCategory->promo_active) {
            $promo = [
                'text' => $tenant->businessCategory->promo_text,
                'discount_pct' => (int) $tenant->businessCategory->discount_pct,
                'category_name' => $tenant->businessCategory->name
            ];
        }

        $settings = \App\Models\LandingSetting::first();

        $plans = $tenant
            ? \App\Models\SubscriptionPlan::where('business_category_id', $tenant->business_category_id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
            : collect();

        return response()->json([
            'data' => $req,
            'category_promo' => $promo,
            'global_settings' => $settings,
            'plans' => $plans,
        ]);
    }

    /**
     * Admin approves a request
     */
    public function approve(Request $request, int $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return DB::transaction(function () use ($id) {
            $subReq = SubscriptionRequest::findOrFail($id);
            
            if ($subReq->status !== 'pending') {
                return response()->json(['message' => 'Permintaan sudah diproses sebelumnya'], 422);
            }

            // Update Tenant Plan and Expiry
            $tenant = Tenant::where('tenant_id', $subReq->tenant_id)->first();
            if ($tenant) {
                $currentExpires = $tenant->subscription_expires_at && $tenant->subscription_expires_at->isFuture()
                    ? $tenant->subscription_expires_at
                    : now();

                $tenant->update([
                    'subscription_plan'       => strtolower($subReq->plan),
                    'subscription_status'     => 'active',
                    'subscription_expires_at' => $currentExpires->copy()->addDays(30),
                ]);
                
                // Notify Tenant Owner
                $owner = $tenant->owner;
                if ($owner) {
                    \App\Models\Notification::create([
                        'user_id' => $owner->id,
                        'type'    => 'success',
                        'title'   => 'Langganan Diaktifkan! 🎉',
                        'message' => "Permintaan upgrade Anda ke paket " . strtoupper($subReq->plan) . " telah disetujui.",
                        'data'    => ['link' => '/retail/subscription']
                    ]);

                    if (!empty($owner->email)) {
                        try {
                            \Illuminate\Support\Facades\Mail::to($owner->email)->send(new \App\Mail\SubscriptionActivatedMail([
                                'customer_name'  => $owner->name,
                                'invoice_number' => 'REQ-' . $subReq->id,
                                'plan'           => ucfirst($subReq->plan),
                                'expires_at'     => $currentExpires->copy()->addDays(30)->format('d M Y'),
                            ]));
                        } catch (\Throwable $e) {
                            \Illuminate\Support\Facades\Log::warning('Gagal mengirim email persetujuan langganan: ' . $e->getMessage());
                        }
                    }
                }
            }

            // Mark this specific request as approved
            $subReq->update(['status' => 'approved']);

            return response()->json(['message' => 'Langganan berhasil diaktifkan!']);
        });
    }

    /**
     * Admin rejects a request
     */
    public function reject(Request $request, int $id)
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
