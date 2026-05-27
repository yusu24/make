<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * List all announcements (Admin only)
     */
    public function index()
    {
        $announcements = Announcement::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $announcements]);
    }

    /**
     * Create a new announcement
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'type'    => 'required|in:maintenance,feature,promo,security',
            'target'  => 'required|in:all,free,basic,pro',
            'status'  => 'required|in:draft,published',
            'content' => 'required|string',
        ]);

        $announcement = Announcement::create([
            'title'   => $request->title,
            'type'    => $request->type,
            'target'  => $request->target,
            'status'  => $request->status,
            'content' => $request->input('content'),
            'date'    => now()->toDateString(),
        ]);

        ActivityLog::record('create_announcement', 'Pengumuman: ' . $announcement->title, 'success');

        return response()->json(['success' => true, 'message' => 'Pengumuman berhasil dibuat', 'data' => $announcement], 201);
    }

    /**
     * Update an existing announcement
     */
    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title'   => 'sometimes|string|max:255',
            'type'    => 'sometimes|in:maintenance,feature,promo,security',
            'target'  => 'sometimes|in:all,free,basic,pro',
            'status'  => 'sometimes|in:draft,published',
            'content' => 'sometimes|string',
        ]);

        $announcement->update($request->only(['title', 'type', 'target', 'status', 'content']));

        ActivityLog::record('update_announcement', 'Pengumuman: ' . $announcement->title, 'info');

        return response()->json(['success' => true, 'message' => 'Pengumuman berhasil diperbarui', 'data' => $announcement]);
    }

    /**
     * Delete an announcement
     */
    public function destroy(Announcement $announcement)
    {
        ActivityLog::record('delete_announcement', 'Pengumuman: ' . $announcement->title, 'danger');
        $announcement->delete();
        return response()->json(['success' => true, 'message' => 'Pengumuman dihapus']);
    }

    /**
     * Toggle published <-> draft status
     */
    public function togglePublish(Announcement $announcement)
    {
        $newStatus = $announcement->status === 'published' ? 'draft' : 'published';
        $announcement->update(['status' => $newStatus]);

        ActivityLog::record(
            'toggle_announcement',
            'Pengumuman: ' . $announcement->title . ' -> ' . strtoupper($newStatus),
            'warning'
        );

        return response()->json(['success' => true, 'message' => 'Status diperbarui', 'data' => $announcement]);
    }
}
