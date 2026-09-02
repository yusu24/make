<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        // Cleanup expired demo tenants older than 24 hours (1 day TTL)
        Tenant::where(function($q) {
            $q->where('tenant_id', 'like', '%demo%')
              ->orWhere('tenant_id', 'like', '%sandbox%');
        })->where('created_at', '<', now()->subHours(24))->each(function($t) {
            \App\Models\User::where('tenant_id', $t->tenant_id)->delete();
            $t->delete();
        });

        $query = Tenant::with('user', 'businessCategory')->latest();

        if ($request->search) {
            $q = $request->search;
            $query->where(function($sub) use ($q) {
                $sub->where('tenant_id', 'like', "%$q%")
                    ->orWhere('business_name', 'like', "%$q%")
                    ->orWhereHas('user', fn ($q2) => $q2->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"));
            });
        }

        if ($request->status) {
            if ($request->status === 'demo') {
                $query->where(function($q) {
                    $q->where('tenant_id', 'like', '%demo%')
                      ->orWhere('tenant_id', 'like', '%sandbox%');
                });
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->plan) $query->where('subscription_plan', $request->plan);

        $tenants = $query->paginate($request->per_page ?? 50);

        $data = collect($tenants->items())->map(function ($t) {
            $isDemo = str_contains(strtolower($t->tenant_id ?? ''), 'demo') || 
                      str_contains(strtolower($t->user?->email ?? ''), 'demo') || 
                      str_contains(strtolower($t->tenant_id ?? ''), 'sandbox');

            return [
                'id'          => $t->id,
                'tenant_id'   => $t->tenant_id,
                'name'        => $t->business_name ?: ($t->user?->name ?? $t->tenant_id),
                'email'       => $t->user?->email,
                'category'    => $t->businessCategory?->name ?? 'Toko Retail',
                'plan'        => $t->subscription_plan,
                'status'      => $t->status,
                'is_demo'     => $isDemo,
                'joined'      => $t->created_at->format('Y-m-d'),
                'created_at'  => $t->created_at->toISOString(),
            ];
        });

        return response()->json(['success' => true, 'data' => $data, 'meta' => [
            'total'        => $tenants->total(),
            'current_page' => $tenants->currentPage(),
            'last_page'    => $tenants->lastPage(),
        ]]);
    }

    public function show(string $id)
    {
        $tenant = Tenant::where('tenant_id', $id)->orWhere('id', $id)->with(['user', 'businessCategory', 'modules'])->firstOrFail();
        
        $isDemo = str_contains(strtolower($tenant->tenant_id ?? ''), 'demo') || 
                  str_contains(strtolower($tenant->user?->email ?? ''), 'demo') || 
                  str_contains(strtolower($tenant->tenant_id ?? ''), 'sandbox');

        // Total products across catalog tables
        $productsCount = \App\Models\RetailProduct::where('tenant_id', $tenant->tenant_id)->count()
            + \App\Models\KulinerProduct::where('tenant_id', $tenant->tenant_id)->count()
            + \App\Models\SellerProduct::where('tenant_id', $tenant->tenant_id)->count();

        // Total transactions
        $transactionsCount = \App\Models\RetailTransaction::where('tenant_id', $tenant->tenant_id)->count()
            + \App\Models\KulinerOrder::where('tenant_id', $tenant->tenant_id)->count()
            + \App\Models\SellerOrder::where('tenant_id', $tenant->tenant_id)->count();

        // Invoices
        $invoices = \App\Models\SaaSInvoice::where('tenant_id', $tenant->tenant_id)->latest()->take(5)->get();

        // Subscription plan info
        $planConfig = \App\Models\SubscriptionPlan::where('business_category_id', $tenant->business_category_id)
            ->where('plan_key', $tenant->subscription_plan)
            ->first();

        $stats = [
            'total_users'        => \App\Models\User::where('tenant_id', $tenant->tenant_id)->count(),
            'total_products'     => $productsCount,
            'total_transactions' => $transactionsCount,
            'total_invoices'     => \App\Models\SaaSInvoice::where('tenant_id', $tenant->tenant_id)->count(),
            'active_modules'     => $tenant->modules()->where('is_active', true)->pluck('name')->toArray(),
            'is_demo'            => $isDemo,
            'plan_price'         => $planConfig?->price ?? 0,
            'max_staff'          => $planConfig?->max_staff ?? 'Unlimited',
            'max_products'       => $planConfig?->max_products ?? 'Unlimited',
        ];

        return response()->json([
            'success' => true,
            'data'    => array_merge($tenant->toArray(), [
                'name'         => $tenant->business_name ?: ($tenant->user?->name ?? $tenant->tenant_id),
                'email'        => $tenant->user?->email,
                'category'     => $tenant->businessCategory?->name ?? 'Toko Retail',
                'joined'       => $tenant->created_at->format('d M Y'),
                'expires_at'   => $tenant->subscription_expires_at ? $tenant->subscription_expires_at->format('d M Y') : 'Aktif Selamanya',
                'stats'        => $stats,
                'invoices'     => $invoices,
                'is_demo'      => $isDemo,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        // Find business category ID based on name
        $category = \App\Models\BusinessCategory::where('name', $request->category)->orWhere('slug', $request->category)->first();
        
        $user = \App\Models\User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => bcrypt('password123'),
            'role'                 => 'customer',
            'tenant_id'            => $request->tenant_id,
            'business_category_id' => $category ? $category->id : null,
        ]);

        $tenant = Tenant::create([
            'user_id'              => $user->id,
            'tenant_id'            => $request->tenant_id,
            'business_name'        => $request->name,
            'business_category_id' => $category ? $category->id : null,
            'subscription_plan'    => $request->plan ?? 'free',
            'status'               => 'active',
        ]);

        return response()->json(['success' => true, 'message' => 'Tenant berhasil dibuat', 'data' => $tenant]);
    }

    public function update(Request $request, string $id)
    {
        $tenant = Tenant::where('tenant_id', $id)->orWhere('id', $id)->firstOrFail();
        
        if ($request->filled('business_name') || $request->filled('name')) {
            $tenant->business_name = $request->business_name ?? $request->name;
        }
        if ($request->filled('subscription_plan')) {
            $tenant->subscription_plan = strtolower($request->subscription_plan);
        }
        if ($request->filled('status')) {
            $tenant->status = $request->status;
        }
        if ($request->filled('category')) {
            $cat = \App\Models\BusinessCategory::where('name', $request->category)->orWhere('slug', $request->category)->first();
            if ($cat) $tenant->business_category_id = $cat->id;
        }
        $tenant->save();

        if ($tenant->user && ($request->filled('name') || $request->filled('email'))) {
            $user = $tenant->user;
            if ($request->filled('name'))  $user->name = $request->name;
            if ($request->filled('email')) $user->email = $request->email;
            $user->save();
        }

        ActivityLog::record('edit_tenant', 'Tenant: ' . $tenant->tenant_id, 'info');
        return response()->json(['success' => true, 'message' => 'Tenant berhasil diperbarui', 'data' => $tenant]);
    }

    public function destroy(string $id)
    {
        $tenant = Tenant::where('tenant_id', $id)->orWhere('id', $id)->firstOrFail();
        ActivityLog::record('delete_tenant', 'Tenant: ' . $tenant->tenant_id, 'danger');
        
        // Delete associated users and tenant
        \App\Models\User::where('tenant_id', $tenant->tenant_id)->delete();
        $tenant->delete();
        
        return response()->json(['success' => true, 'message' => 'Tenant berhasil dihapus dari sistem']);
    }

    public function getModules(string $tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $allModules = \App\Models\Module::all();
        $activeModules = $tenant->modules()->where('is_active', true)->pluck('modules.id')->toArray();

        $data = $allModules->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'is_active' => in_array($m->id, $activeModules)
        ]);

        return response()->json(['data' => $data]);
    }

    public function updateModules(Request $request, string $tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $moduleIds = $request->module_ids; // Array of IDs

        // Reset all
        $tenant->modules()->update(['is_active' => false]);

        // Set active
        if (!empty($moduleIds)) {
            foreach ($moduleIds as $mid) {
                // Ensure record exists in pivot first (seeders should have handled this, but just in case)
                $exists = $tenant->modules()->where('modules.id', $mid)->exists();
                if (!$exists) {
                    $tenant->modules()->attach($mid, ['is_active' => true]);
                } else {
                    $tenant->modules()->updateExistingPivot($mid, ['is_active' => true]);
                }
            }
        }

        return response()->json(['message' => 'Modul diperbarui']);
    }

    public function updatePlan(Request $request, string $tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $tenant->update(['subscription_plan' => $request->plan]);
        return response()->json(['message' => 'Paket berhasil diperbarui']);
    }

    public function updateStatus(Request $request, string $tenant_id)
    {
        $request->validate(['status' => 'required|in:active,inactive,pending']);

        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $tenant->update(['status' => $request->status]);
        ActivityLog::record('update_tenant_status', "Tenant: {$tenant->tenant_id} -> {$request->status}", 'info');

        return response()->json(['success' => true, 'message' => 'Status tenant berhasil diperbarui', 'data' => $tenant]);
    }

    public function resendInvoice(string $tenant_id)
    {
        $tenant = Tenant::with('user')->where('tenant_id', $tenant_id)->firstOrFail();
        $email = $tenant->user?->email;

        if (!$email) {
            return response()->json(['success' => false, 'message' => 'Email pelanggan tidak ditemukan untuk tenant ini.'], 404);
        }

        try {
            $settings = \App\Http\Controllers\Api\AdminInvoiceSettingController::getInvoiceSettings();
            $planName = strtoupper($tenant->subscription_plan ?? 'BASIC');
            $tenantName = $tenant->user?->name ?? 'Pelanggan';

            // Find or build invoice data
            $invRecord = \App\Models\TenantInvoice::where('tenant_id', $tenant_id)->latest()->first();
            $invoiceId = $invRecord ? $invRecord->id : 'INV-' . strtoupper(substr(md5($tenant_id), 0, 6));
            $amount = $invRecord ? (float)$invRecord->amount : ($tenant->subscription_plan === 'pro' ? 299000 : 149000);

            $invoiceData = [
                'id'           => $invoiceId,
                'tenant_id'    => $tenant->tenant_id,
                'tenant_name'  => $tenant->user?->name ?? $tenant->business_name ?? 'Pelanggan',
                'tenant_email' => $email,
                'plan'         => $planName,
                'amount'       => $amount,
                'status'       => $tenant->status === 'active' ? 'paid' : 'unpaid',
                'date'         => date('Y-m-d'),
                'due_date'     => date('Y-m-d', strtotime('+7 days')),
            ];

            // Render PDF Invoice
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', [
                'invoice'  => $invoiceData,
                'settings' => $settings,
            ]);
            $pdfContent = $pdf->output();

            // Determine template based on payment status
            $isPaid = ($invoiceData['status'] === 'paid');
            $rawSubject = $isPaid
                ? ($settings['email_subject_paid'] ?? "Kuitansi & Bukti Pembayaran Lunas BIZORA ({$tenant->tenant_id})")
                : ($settings['email_subject_unpaid'] ?? $settings['email_subject'] ?? "Tagihan / Invoice Langganan BIZORA ({$tenant->tenant_id})");

            $rawBody = $isPaid
                ? ($settings['email_body_paid_template'] ?? "Halo {$tenantName},\n\nPembayaran langganan paket BIZORA Anda telah LUNAS.\nTerlampir file PDF Bukti Pembayaran.")
                : ($settings['email_body_unpaid_template'] ?? $settings['email_body_template'] ?? "Halo {$tenantName},\n\nBerikut terlampir file PDF Tagihan / Invoice langganan Anda.");

            // Format Email Template
            $subject = str_replace(
                ['{tenant_id}', '{tenant_name}', '{plan}', '{amount}', '{status}'],
                [$tenant->tenant_id, $tenantName, $planName, number_format($amount, 0, ',', '.'), $invoiceData['status']],
                $rawSubject
            );

            $body = str_replace(
                ['{tenant_id}', '{tenant_name}', '{plan}', '{amount}', '{status}'],
                [$tenant->tenant_id, $tenantName, $planName, number_format($amount, 0, ',', '.'), $invoiceData['status']],
                $rawBody
            );

            Mail::raw($body, function ($message) use ($email, $subject, $pdfContent, $tenant_id) {
                $message->to($email)
                        ->subject($subject)
                        ->attachData($pdfContent, "Invoice_{$tenant_id}.pdf", [
                            'mime' => 'application/pdf',
                        ]);
            });

            ActivityLog::record('resend_invoice', "Mengirim ulang invoice + PDF untuk Tenant: {$tenant->tenant_id} ke {$email}", 'info');

            return response()->json([
                'success' => true,
                'message' => "Invoice PDF berhasil dikirimkan ke email {$email}"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email invoice: ' . $e->getMessage()
            ], 500);
        }
    }
}
