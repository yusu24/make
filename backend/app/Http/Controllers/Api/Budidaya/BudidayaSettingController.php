<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use App\Models\BudidayaSetting;
use App\Models\BudidayaSpecies;
use App\Services\Budidaya\BudidayaPresetService;
use Illuminate\Http\Request;

class BudidayaSettingController extends Controller
{
    /**
     * Get farming context, current profile, active feature flags, and localized terminology dictionary.
     */
    public function getContext(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $email = strtolower($request->user()->email ?? '');

        $setting = BudidayaSetting::where('tenant_id', $tenantId)->first();

        // Default heuristic if not set yet
        if (!$setting) {
            $cat = 'aquaculture';
            $prof = 'bioflok_lele';

            if (str_contains($email, 'ayam') || str_contains($email, 'unggas') || str_contains($email, 'bebek') || str_contains($email, 'puyuh')) {
                $cat = 'poultry';
                $prof = 'ayam_broiler';
            } elseif (str_contains($email, 'sapi') || str_contains($email, 'kambing') || str_contains($email, 'domba') || str_contains($email, 'ternak') || str_contains($email, 'ruminansia')) {
                $cat = 'livestock';
                $prof = 'livestock_beef_cattle';
            } elseif (str_contains($email, 'burung') || str_contains($email, 'lovebird') || str_contains($email, 'kenari') || str_contains($email, 'murai')) {
                $cat = 'bird';
                $prof = 'lovebird_breeding';
            }

            $preset = BudidayaPresetService::resolveProfile($cat, $prof);

            $setting = BudidayaSetting::create([
                'tenant_id'        => $tenantId,
                'farming_category' => $cat,
                'farming_profile'  => $prof,
                'tracking_mode'    => $preset['tracking_mode'] ?? 'group',
                'feature_flags'    => $preset['features'] ?? [],
                'terminology'      => $preset['terminology'] ?? [],
                'farm_name'        => 'Farm ' . ($request->user()->name ?? 'BIZORA'),
                'farm_type'        => match ($cat) {
                    'poultry'   => 'unggas',
                    'livestock' => 'ruminansia',
                    default     => 'ikan'
                }
            ]);
        } else {
            // Auto-heal existing demo sessions based on email hint
            if (str_contains($email, 'sapi') || str_contains($email, 'ruminansia') || str_contains($email, 'kambing') || str_contains($email, 'domba')) {
                if ($setting->farming_category !== 'livestock') {
                    $setting->farming_category = 'livestock';
                    $setting->farming_profile = 'livestock_beef_cattle';
                    $setting->farm_type = 'ruminansia';
                    $setting->save();
                }
            } elseif (str_contains($email, 'ayam') || str_contains($email, 'unggas') || str_contains($email, 'bebek')) {
                if ($setting->farming_category !== 'poultry') {
                    $setting->farming_category = 'poultry';
                    $setting->farming_profile = 'poultry_broiler';
                    $setting->farm_type = 'unggas';
                    $setting->save();
                }
            } elseif (empty($setting->farming_category)) {
                $setting->farming_category = match ($setting->farm_type) {
                    'ruminansia', 'sapi' => 'livestock',
                    'unggas', 'ayam'     => 'poultry',
                    'burung'             => 'bird',
                    default              => 'aquaculture',
                };
                $setting->save();
            }
        }

        // Active species for this category
        $species = BudidayaSpecies::where(function ($q) use ($tenantId) {
            $q->whereNull('tenant_id')->orWhere('tenant_id', $tenantId);
        })
        ->where('category', $setting->farming_category ?? 'aquaculture')
        ->where('is_active', true)
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'setting'           => $setting,
                'farming_category'  => $setting->farming_category,
                'farm_type'         => $setting->farm_type ?? ($setting->farming_category === 'livestock' ? 'ruminansia' : ($setting->farming_category === 'poultry' ? 'unggas' : 'ikan')),
                'category'          => $setting->farming_category,
                'profile'           => $setting->farming_profile,
                'farm_name'         => $setting->farm_name,
                'tracking_mode'     => $setting->tracking_mode,
                'feature_flags'     => $setting->feature_flags,
                'terminology'       => $setting->terminology,
                'available_species' => $species,
            ]
        ]);
    }

    /**
     * Get list of all preset profiles for category switching.
     */
    public function getPresets()
    {
        return response()->json([
            'status' => 'success',
            'data'   => BudidayaPresetService::getProfiles(),
        ]);
    }

    public function getSettings(Request $request)
    {
        return $this->getContext($request);
    }

    public function updateSettings(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $request->validate([
            'farming_category' => 'nullable|in:aquaculture,poultry,livestock,bird,other',
            'farming_profile'  => 'nullable|string',
            'tracking_mode'    => 'nullable|in:group,individual,hybrid',
            'feature_flags'    => 'nullable|array',
            'terminology'      => 'nullable|array',
            'farm_name'        => 'nullable|string|max:255',
            'farm_type'        => 'nullable|string',
        ]);

        $cat = $request->farming_category ?? 'aquaculture';
        $prof = $request->farming_profile;

        // If category or profile provided but no explicit feature flags, apply preset defaults
        $preset = BudidayaPresetService::resolveProfile($cat, $prof);
        $flags = $request->feature_flags ?? $preset['features'] ?? [];
        $terms = $request->terminology ?? $preset['terminology'] ?? [];

        $setting = BudidayaSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'farming_category' => $cat,
                'farming_profile'  => $prof ?? array_key_first($preset),
                'tracking_mode'    => $request->tracking_mode ?? ($preset['tracking_mode'] ?? 'group'),
                'feature_flags'    => $flags,
                'terminology'      => $terms,
                'farm_name'        => $request->farm_name ?? 'Farm BIZORA',
                'farm_type'        => match ($cat) {
                    'poultry'   => 'unggas',
                    'livestock' => 'ruminansia',
                    default     => 'ikan'
                }
            ]
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengaturan profil budidaya berhasil disimpan',
            'data'    => $setting
        ]);
    }
}
