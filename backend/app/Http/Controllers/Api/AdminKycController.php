<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;

class AdminKycController extends Controller
{
    public function index()
    {
        $kycs = Tenant::with(['user', 'businessCategory'])
            ->orderByRaw("FIELD(COALESCE(kyc_status, 'unverified'), 'pending', 'rejected', 'unverified', 'verified')")
            ->orderBy('kyc_submitted_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($t) {
                $settings = is_array($t->settings) ? $t->settings : (json_decode($t->settings, true) ?: []);
                return [
                    'id' => $t->id,
                    'tenant_id' => $t->tenant_id ?: 'TN-' . str_pad($t->id, 4, '0', STR_PAD_LEFT),
                    'name' => $t->business_name ?: ($t->name ?: 'Tenant ' . $t->id),
                    'business_category' => $t->businessCategory?->name ?: 'Retail',
                    'owner_name' => $t->user?->name ?: 'Pemilik Toko',
                    'owner_email' => $t->user?->email,
                    'owner_phone' => $t->user?->phone ?: $t->phone,
                    'nik' => $settings['nik'] ?? ($t->nik ?? '-'),
                    'kyc_status' => $t->kyc_status ?: 'unverified',
                    'kyc_document_type' => $settings['kyc_document_type'] ?? 'KTP / NIB',
                    'kyc_document_path' => $t->kyc_document_path ? asset('storage/' . $t->kyc_document_path) : null,
                    'kyc_notes' => $t->kyc_notes,
                    'kyc_submitted_at' => $t->kyc_submitted_at,
                    'kyc_verified_at' => $t->kyc_verified_at,
                ];
            });
            
        return response()->json(['success' => true, 'data' => $kycs]);
    }

    public function approve($tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->orWhere('id', $tenant_id)->firstOrFail();
        $tenant->kyc_status = 'verified';
        $tenant->kyc_verified_at = now();
        $tenant->kyc_notes = 'Dokumen KYC telah diverifikasi dan disetujui resmi.';
        $tenant->save();

        return response()->json(['success' => true, 'message' => 'Dokumen KYC berhasil disetujui & diverifikasi.']);
    }

    public function reject(Request $request, $tenant_id)
    {
        $request->validate(['notes' => 'required|string']);

        $tenant = Tenant::where('tenant_id', $tenant_id)->orWhere('id', $tenant_id)->firstOrFail();
        $tenant->kyc_status = 'rejected';
        $tenant->kyc_notes = $request->notes;
        $tenant->save();

        return response()->json(['success' => true, 'message' => 'Dokumen KYC ditolak dengan catatan.']);
    }
}
