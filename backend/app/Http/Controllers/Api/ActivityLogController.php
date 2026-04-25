<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        if ($request->search) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('action', 'like', "%$q%")
                   ->orWhere('target', 'like', "%$q%")
                   ->orWhereHas('user', fn ($q3) => $q3->where('name', 'like', "%$q%"));
            });
        }

        if ($request->level) $query->where('level', $request->level);

        $logs = $query->paginate($request->per_page ?? 50);

        $data = collect($logs->items())->map(fn ($l) => [
            'id'     => $l->id,
            'user'   => $l->user?->name ?? 'System',
            'action' => $l->action,
            'target' => $l->target,
            'level'  => $l->level,
            'ip'     => $l->ip_address ?? '-',
            'time'   => $l->created_at->format('Y-m-d H:i:s'),
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }
}
