<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TenantKycController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;
        if (!$tenant) return response()->json(['message' => 'Tenant not found'], 404);

        return response()->json([
            'success' => true,
            'data' => [
                'kyc_status' => $tenant->kyc_status,
                'kyc_notes' => $tenant->kyc_notes,
                'kyc_document_path' => $tenant->kyc_document_path,
                'kyc_submitted_at' => $tenant->kyc_submitted_at,
                'kyc_verified_at' => $tenant->kyc_verified_at,
            ]
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'document' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $tenant = $request->user()->tenant;
        
        if (!$tenant) {
            return response()->json(['message' => 'Tenant tidak ditemukan'], 404);
        }

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('kyc_documents', 'public');
            $tenant->kyc_document_path = $path;
            $tenant->kyc_status = 'pending';
            $tenant->kyc_submitted_at = now();
            $tenant->kyc_notes = null;
            $tenant->save();

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil diunggah dan sedang ditinjau.'
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Tidak ada file.'], 400);
    }
}
