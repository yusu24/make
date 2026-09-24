<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Tenant;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * List all announcements (Admin only) + Audience stats
     */
    public function index()
    {
        $announcements = Announcement::orderBy('created_at', 'desc')->get();
        $totalTenants = Tenant::count();

        // Calculate reach estimates for each announcement
        $data = $announcements->map(function ($a) use ($totalTenants) {
            $reachCount = $this->calculateAudienceReach($a->target, $totalTenants);
            $arr = $a->toArray();
            $arr['estimated_reach'] = $reachCount;
            $arr['reach_percentage'] = $totalTenants > 0 ? round(($reachCount / $totalTenants) * 100) : 100;
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'total_tenants' => $totalTenants,
            ]
        ]);
    }

    /**
     * Create a new broadcast announcement
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required|string|max:255',
            'type'         => 'required|in:maintenance,feature,promo,security,urgent',
            'display_type' => 'nullable|in:modal,banner,toast',
            'target'       => 'required|string',
            'status'       => 'required|in:draft,published',
            'content'      => 'required|string',
            'action_url'   => 'nullable|string|max:500',
            'action_text'  => 'nullable|string|max:100',
            'expires_at'   => 'nullable|date',
        ]);

        $announcement = Announcement::create([
            'title'        => $request->title,
            'type'         => $request->type,
            'display_type' => $request->display_type ?? 'modal',
            'target'       => $request->target,
            'status'       => $request->status,
            'content'      => $request->input('content'),
            'action_url'   => $request->action_url,
            'action_text'  => $request->action_text,
            'date'         => now()->toDateString(),
            'expires_at'   => $request->expires_at,
        ]);

        ActivityLog::record('create_announcement', 'Broadcast: ' . $announcement->title, 'success');

        return response()->json([
            'success' => true,
            'message' => 'Broadcast pengumuman berhasil dibuat',
            'data' => $announcement
        ], 201);
    }

    /**
     * Update an existing broadcast announcement
     */
    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title'        => 'sometimes|string|max:255',
            'type'         => 'sometimes|in:maintenance,feature,promo,security,urgent',
            'display_type' => 'nullable|in:modal,banner,toast',
            'target'       => 'sometimes|string',
            'status'       => 'sometimes|in:draft,published',
            'content'      => 'sometimes|string',
            'action_url'   => 'nullable|string|max:500',
            'action_text'  => 'nullable|string|max:100',
            'expires_at'   => 'nullable|date',
        ]);

        $announcement->update($request->only([
            'title', 'type', 'display_type', 'target', 'status', 'content', 'action_url', 'action_text', 'expires_at'
        ]));

        ActivityLog::record('update_announcement', 'Broadcast: ' . $announcement->title, 'info');

        return response()->json([
            'success' => true,
            'message' => 'Broadcast pengumuman berhasil diperbarui',
            'data' => $announcement
        ]);
    }

    /**
     * Toggle publish / draft status
     */
    public function togglePublish(Announcement $announcement)
    {
        $newStatus = $announcement->status === 'published' ? 'draft' : 'published';
        $announcement->update(['status' => $newStatus]);

        ActivityLog::record('toggle_announcement', 'Broadcast ' . $announcement->title . ' -> ' . $newStatus, 'info');

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'published' ? 'Pengumuman dipublikasikan ke tenant' : 'Pengumuman ditarik ke draft',
            'data' => $announcement
        ]);
    }

    /**
     * Delete an announcement
     */
    public function destroy(Announcement $announcement)
    {
        ActivityLog::record('delete_announcement', 'Broadcast: ' . $announcement->title, 'danger');
        $announcement->delete();
        return response()->json(['success' => true, 'message' => 'Pengumuman dihapus']);
    }

    /**
     * Get active published announcements targeted for current tenant
     */
    public function activeForTenant(Request $request)
    {
        $user = $request->user();
        $tenant = $user?->tenant;
        $plan = strtolower($tenant?->subscription_plan ?? 'free');
        $category = strtolower($tenant?->type ?? $tenant?->businessCategory?->name ?? '');

        // Match target audience
        $validTargets = ['all', 'semua'];
        if ($plan) {
            $validTargets[] = $plan;
            $validTargets[] = 'plan_' . $plan;
        }
        if ($category) {
            $validTargets[] = $category;
            $validTargets[] = 'cat_' . $category;
            if (str_contains($category, 'kuliner') || str_contains($category, 'f&b')) {
                $validTargets[] = 'kuliner';
                $validTargets[] = 'f&b / kuliner';
            }
            if (str_contains($category, 'retail')) {
                $validTargets[] = 'retail';
            }
            if (str_contains($category, 'jasa')) {
                $validTargets[] = 'jasa';
            }
            if (str_contains($category, 'budidaya')) {
                $validTargets[] = 'budidaya';
            }
            if (str_contains($category, 'seller') || str_contains($category, 'reseller')) {
                $validTargets[] = 'seller';
            }
        }

        $query = Announcement::where('status', 'published')
            ->where(function ($q) use ($validTargets) {
                $q->whereIn('target', $validTargets)
                  ->orWhere('target', 'all');
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->take(10);

        $announcements = $query->get();

        return response()->json(['success' => true, 'data' => $announcements]);
    }

    private function calculateAudienceReach(string $target, int $totalTenants): int
    {
        if ($target === 'all' || empty($target)) {
            return $totalTenants;
        }

        $t = strtolower($target);
        if (in_array($t, ['free', 'starter', 'plan_free'])) {
            return Tenant::where(function($q){
                $q->where('subscription_plan', 'like', '%free%')
                  ->orWhere('subscription_plan', 'like', '%starter%');
            })->count();
        }
        if (in_array($t, ['pro', 'plan_pro'])) {
            return Tenant::where('subscription_plan', 'like', '%pro%')->count();
        }
        if (in_array($t, ['enterprise', 'plan_enterprise'])) {
            return Tenant::where('subscription_plan', 'like', '%enterprise%')->count();
        }
        if (str_contains($t, 'retail')) {
            return Tenant::where(function($q) {
                $q->where('type', 'like', '%retail%')
                  ->orWhereHas('businessCategory', function($sq) {
                      $sq->where('name', 'like', '%retail%')->orWhere('slug', 'like', '%retail%');
                  });
            })->count();
        }
        if (str_contains($t, 'kuliner')) {
            return Tenant::where(function($q){
                $q->where('type', 'like', '%kuliner%')
                  ->orWhere('type', 'like', '%f&b%')
                  ->orWhereHas('businessCategory', function($sq) {
                      $sq->where('name', 'like', '%kuliner%')->orWhere('name', 'like', '%f&b%')->orWhere('slug', 'like', '%kuliner%');
                  });
            })->count();
        }
        if (str_contains($t, 'jasa')) {
            return Tenant::where(function($q) {
                $q->where('type', 'like', '%jasa%')
                  ->orWhereHas('businessCategory', function($sq) {
                      $sq->where('name', 'like', '%jasa%')->orWhere('slug', 'like', '%jasa%');
                  });
            })->count();
        }
        if (str_contains($t, 'budidaya')) {
            return Tenant::where(function($q) {
                $q->where('type', 'like', '%budidaya%')
                  ->orWhereHas('businessCategory', function($sq) {
                      $sq->where('name', 'like', '%budidaya%')->orWhere('slug', 'like', '%budidaya%');
                  });
            })->count();
        }
        if (str_contains($t, 'seller')) {
            return Tenant::where(function($q){
                $q->where('type', 'like', '%seller%')
                  ->orWhere('type', 'like', '%reseller%')
                  ->orWhereHas('businessCategory', function($sq) {
                      $sq->where('name', 'like', '%seller%')->orWhere('name', 'like', '%reseller%')->orWhere('slug', 'like', '%seller%');
                  });
            })->count();
        }

        return max(1, (int) round($totalTenants * 0.4));
    }
}

