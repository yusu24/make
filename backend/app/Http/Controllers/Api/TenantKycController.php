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

        $settings = is_array($tenant->settings) ? $tenant->settings : (json_decode($tenant->settings, true) ?: []);

        return response()->json([
            'success' => true,
            'data' => [
                'kyc_status' => $tenant->kyc_status ?: 'unverified',
                'kyc_notes' => $tenant->kyc_notes,
                'kyc_document_type' => $settings['kyc_document_type'] ?? 'KTP',
                'nik' => $settings['nik'] ?? null,
                'kyc_document_path' => $tenant->kyc_document_path ? asset('storage/' . $tenant->kyc_document_path) : null,
                'kyc_submitted_at' => $tenant->kyc_submitted_at,
                'kyc_verified_at' => $tenant->kyc_verified_at,
            ]
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'nik' => 'nullable|string|max:30',
            'document_type' => 'nullable|string|max:50'
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

            $settings = is_array($tenant->settings) ? $tenant->settings : (json_decode($tenant->settings, true) ?: []);
            if ($request->filled('nik')) {
                $settings['nik'] = $request->nik;
            }
            if ($request->filled('document_type')) {
                $settings['kyc_document_type'] = $request->document_type;
            }
            $tenant->settings = $settings;
            $tenant->save();

            return response()->json([
                'success' => true,
                'message' => 'Dokumen KYC berhasil diunggah dan sedang ditinjau oleh Admin.',
                'data' => [
                    'kyc_status' => $tenant->kyc_status,
                    'kyc_document_path' => asset('storage/' . $path)
                ]
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Tidak ada file dokumen yang dipilih.'], 400);
    }
}
