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
        $query = Tenant::with('user', 'businessCategory')->latest();

        if ($request->search) {
            $q = $request->search;
            $query->whereHas('user', fn ($q2) => $q2->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"));
        }

        if ($request->status) $query->where('status', $request->status);
        if ($request->plan)   $query->where('subscription_plan', $request->plan);

        $tenants = $query->paginate($request->per_page ?? 20);

        $data = collect($tenants->items())->map(fn ($t) => [
            'id'          => $t->id,
            'tenant_id'   => $t->tenant_id,
            'name'        => $t->user?->name,
            'email'       => $t->user?->email,
            'category'    => $t->businessCategory?->name,
            'plan'        => $t->subscription_plan,
            'status'      => $t->status,
            'joined'      => $t->created_at->format('Y-m-d'),
        ]);

        return response()->json(['success' => true, 'data' => $data, 'meta' => [
            'total'        => $tenants->total(),
            'current_page' => $tenants->currentPage(),
            'last_page'    => $tenants->lastPage(),
        ]]);
    }

    public function show(Tenant $tenant)
    {
        $tenant->load('user', 'businessCategory');
        return response()->json(['success' => true, 'data' => $tenant]);
    }

    public function store(Request $request)
    {
        // Find business category ID based on name
        $category = \App\Models\BusinessCategory::where('name', $request->category)->first();
        
        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt('password123'),
            'role' => 'admin', // Tenant owner is an admin of their own store
            'tenant_id' => $request->tenant_id,
            'business_category_id' => $category ? $category->id : null,
        ]);

        $tenant = Tenant::create([
            'user_id' => $user->id,
            'tenant_id' => $request->tenant_id,
            'business_category_id' => $category ? $category->id : null,
            'subscription_plan' => $request->plan ?? 'free',
            'status' => 'active',
        ]);

        return response()->json(['success' => true, 'message' => 'Tenant berhasil dibuat']);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $tenant->update($request->only('status', 'subscription_plan', 'business_name'));
        ActivityLog::record('edit_tenant', 'Tenant: ' . $tenant->tenant_id, 'info');
        return response()->json(['success' => true, 'message' => 'Tenant diperbarui']);
    }

    public function destroy(Tenant $tenant)
    {
        ActivityLog::record('delete_tenant', 'Tenant: ' . $tenant->tenant_id, 'danger');
        $tenant->delete();
        return response()->json(['success' => true, 'message' => 'Tenant dihapus']);
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

            // Format Email Template
            $subject = str_replace(
                ['{tenant_id}', '{tenant_name}', '{plan}', '{amount}', '{status}'],
                [$tenant->tenant_id, $tenantName, $planName, number_format($amount, 0, ',', '.'), $tenant->status],
                $settings['email_subject'] ?? "Tagihan / Invoice Langganan BIZORA ({$tenant->tenant_id})"
            );

            $body = str_replace(
                ['{tenant_id}', '{tenant_name}', '{plan}', '{amount}', '{status}'],
                [$tenant->tenant_id, $tenantName, $planName, number_format($amount, 0, ',', '.'), $tenant->status],
                $settings['email_body_template'] ?? "Halo {$tenantName},\n\nBerikut terlampir file PDF Invoice langganan Anda."
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
