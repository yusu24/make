<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RetailSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TenantBrandingController extends Controller
{
    /**
     * Get current tenant branding / logo info
     */
    public function getBranding(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return response()->json([
                'success' => true,
                'data' => [
                    'store_name' => $user->name,
                    'store_icon_path' => null,
                    'store_icon_url' => null,
                ]
            ]);
        }

        $settings = is_array($tenant->settings) ? $tenant->settings : (json_decode($tenant->settings ?? '[]', true) ?: []);
        $path = $settings['store_icon_path'] ?? $settings['logo_path'] ?? null;

        if (!$path) {
            $retailSetting = RetailSetting::where('tenant_id', $tenant->tenant_id)->first();
            if ($retailSetting && $retailSetting->store_icon_path) {
                $path = $retailSetting->store_icon_path;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'store_name' => $tenant->business_name ?: $tenant->name ?: $user->name,
                'store_icon_path' => $path,
                'store_icon_url' => $path ? asset('storage/' . $path) : null,
            ]
        ]);
    }

    /**
     * Upload or update store logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'store_icon' => 'required|image|mimes:jpg,jpeg,png,webp,svg|max:5120',
        ], [
            'store_icon.required' => 'File logo toko wajib diunggah.',
            'store_icon.image' => 'Berkas harus berupa gambar yang valid.',
            'store_icon.mimes' => 'Format file yang didukung: JPG, PNG, WEBP, atau SVG.',
            'store_icon.max' => 'Ukuran file maksimal adalah 5MB.',
        ]);

        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant tidak ditemukan.'], 404);
        }

        $settings = is_array($tenant->settings) ? $tenant->settings : (json_decode($tenant->settings ?? '[]', true) ?: []);
        $oldPath = $settings['store_icon_path'] ?? null;

        // Delete previous logo file if exists
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('store_icon')->store('tenant-logos', 'public');
        $settings['store_icon_path'] = $path;
        $tenant->settings = $settings;
        $tenant->save();

        // Also sync to RetailSetting for backward compatibility with retail POS & settings
        $retailSetting = RetailSetting::where('tenant_id', $tenant->tenant_id)->first();
        if ($retailSetting) {
            $retailSetting->update(['store_icon_path' => $path]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logo toko berhasil diperbarui.',
            'data' => [
                'store_icon_path' => $path,
                'store_icon_url' => asset('storage/' . $path),
            ]
        ]);
    }

    /**
     * Delete store logo and revert to default
     */
    public function deleteLogo(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant tidak ditemukan.'], 404);
        }

        $settings = is_array($tenant->settings) ? $tenant->settings : (json_decode($tenant->settings ?? '[]', true) ?: []);
        $oldPath = $settings['store_icon_path'] ?? null;

        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        unset($settings['store_icon_path']);
        unset($settings['logo_path']);
        $tenant->settings = $settings;
        $tenant->save();

        $retailSetting = RetailSetting::where('tenant_id', $tenant->tenant_id)->first();
        if ($retailSetting) {
            $retailSetting->update(['store_icon_path' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logo toko berhasil dihapus dan dikembalikan ke default.',
            'data' => [
                'store_icon_path' => null,
                'store_icon_url' => null,
            ]
        ]);
    }
}