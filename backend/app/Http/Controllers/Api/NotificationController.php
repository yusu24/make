<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $query = Notification::where('user_id', $request->user()->id)
            ->latest();

        // If it's a tenant owner/staff, show their tenant notifications too
        if ($tenantId) {
            $query->orWhere(function($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId)->whereNull('user_id');
            });
        }

        $notifications = $query->take(20)->get();
        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $notif = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notif->update(['read_at' => now()]);
        return response()->json(['message' => 'Notification read']);
    }

    public function readAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
            
        return response()->json(['message' => 'All marked as read']);
    }
}
