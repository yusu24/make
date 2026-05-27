<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\LandingSetting;
use Illuminate\Http\Request;

class LandingSettingController extends Controller
{
    public function get()
    {
        $settings = LandingSetting::first();
        if (!$settings) {
            $settings = LandingSetting::create([
                'hero_title' => 'Kelola Bisnis UMKM',
                'hero_subtitle' => 'Lebih Cerdas & Mudah',
                'hero_desc' => 'Satu platform untuk retail, budidaya ikan, kuliner, dan jasa. Kelola stok, pesanan, laporan keuangan, dan pelanggan dalam satu genggaman.',
                'campaign_text' => 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat UMKM Anda naik tingkat. Hubungi admin untuk mendapatkan promo menarik per kategori bisnis Anda.',
                'campaign_active' => true,
                'show_sandbox' => true,
                'show_features' => true,
                'show_testimonials' => true,
                'featured_categories' => ['toko-retail', 'budidaya-ikan', 'kuliner', 'jasa'],
                'bank_name' => 'BANK BCA',
                'bank_account_no' => '8837 001 992',
                'bank_account_name' => 'PT Antigravity Global SaaS',
                'price_basic' => 149000,
                'price_pro' => 299000,
            ]);
        }
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function update(Request $request)
    {
        $settings = LandingSetting::first();
        if (!$settings) {
            $settings = new LandingSetting();
        }

        $settings->fill([
            'hero_title'       => $request->hero_title ?? $settings->hero_title ?? 'Kelola Bisnis UMKM',
            'hero_subtitle'    => $request->hero_subtitle ?? $settings->hero_subtitle ?? 'Lebih Cerdas & Mudah',
            'hero_desc'        => $request->has('hero_desc') ? $request->hero_desc : $settings->hero_desc,
            'campaign_text'    => $request->has('campaign_text') ? $request->campaign_text : $settings->campaign_text,
            'campaign_active'  => $request->has('campaign_active') ? filter_var($request->campaign_active, FILTER_VALIDATE_BOOLEAN) : $settings->campaign_active,
            'show_sandbox'     => $request->has('show_sandbox') ? filter_var($request->show_sandbox, FILTER_VALIDATE_BOOLEAN) : $settings->show_sandbox,
            'show_features'    => $request->has('show_features') ? filter_var($request->show_features, FILTER_VALIDATE_BOOLEAN) : $settings->show_features,
            'show_testimonials'=> $request->has('show_testimonials') ? filter_var($request->show_testimonials, FILTER_VALIDATE_BOOLEAN) : $settings->show_testimonials,
            'featured_categories'=> $request->has('featured_categories') ? $request->featured_categories : $settings->featured_categories,
            'bank_name'        => $request->has('bank_name') ? $request->bank_name : $settings->bank_name,
            'bank_account_no'  => $request->has('bank_account_no') ? $request->bank_account_no : $settings->bank_account_no,
            'bank_account_name'=> $request->has('bank_account_name') ? $request->bank_account_name : $settings->bank_account_name,
            'price_basic'      => $request->has('price_basic') ? intval($request->price_basic) : $settings->price_basic,
            'price_pro'        => $request->has('price_pro') ? intval($request->price_pro) : $settings->price_pro,
        ]);

        $settings->save();

        ActivityLog::record('update_landing_settings', 'Pengaturan Portal diperbarui', 'info');

        return response()->json(['success' => true, 'message' => 'Pengaturan portal berhasil diperbarui', 'data' => $settings]);
    }
}
