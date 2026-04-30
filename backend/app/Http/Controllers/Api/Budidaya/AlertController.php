<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use App\Models\BudidayaAlert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    /**
     * Get latest alerts for the tenant.
     */
    public function index(Request $request)
    {
        $alerts = BudidayaAlert::with('pond')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'unread_count' => BudidayaAlert::where('is_read', false)->count()
        ]);
    }

    /**
     * Mark all alerts as read.
     */
    public function markAllAsRead()
    {
        BudidayaAlert::where('is_read', false)->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All alerts marked as read'
        ]);
    }

    /**
     * Mark a single alert as read.
     */
    public function markAsRead($id)
    {
        $alert = BudidayaAlert::findOrFail($id);
        $alert->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => $alert
        ]);
    }
}
