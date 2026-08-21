<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;

class AdminKycController extends Controller
{
    public function index()
    {
        $kycs = Tenant::whereIn('kyc_status', ['pending', 'verified', 'rejected'])
            ->orderByRaw("FIELD(kyc_status, 'pending', 'rejected', 'verified')")
            ->orderBy('kyc_submitted_at', 'desc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $kycs]);
    }

    public function approve($tenant_id)
    {
        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $tenant->kyc_status = 'verified';
        $tenant->kyc_verified_at = now();
        $tenant->kyc_notes = null;
        $tenant->save();

        return response()->json(['success' => true, 'message' => 'Dokumen berhasil disetujui.']);
    }

    public function reject(Request $request, $tenant_id)
    {
        $request->validate(['notes' => 'required|string']);

        $tenant = Tenant::where('tenant_id', $tenant_id)->firstOrFail();
        $tenant->kyc_status = 'rejected';
        $tenant->kyc_notes = $request->notes;
        $tenant->save();

        return response()->json(['success' => true, 'message' => 'Dokumen ditolak.']);
    }
}
