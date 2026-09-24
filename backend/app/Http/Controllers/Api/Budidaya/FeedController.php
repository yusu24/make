<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaFeedStock;
use App\Models\BudidayaFeeding;
use Illuminate\Support\Facades\DB;

class FeedController extends Controller
{
    private function getTenantId(Request $request): string
    {
        $tenantId = $request->attributes->get('tenant_id') ?? $request->user()?->tenant_id;
        if (empty($tenantId)) {
            abort(response()->json(['message' => 'Unauthorized: No Tenant ID associated with this user.'], 403));
        }
        return $tenantId;
    }

    // List feed inventory
    public function index(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $feeds = BudidayaFeedStock::where('tenant_id', $tenantId)->get();
        return response()->json(['data' => $feeds]);
    }

    // Add or update feed stock inventory
    public function store(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $request->validate([
            'name' => 'required|string',
            'stock_kg' => 'required|numeric'
        ]);

        $feed = BudidayaFeedStock::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'stock_kg' => $request->stock_kg
        ]);

        return response()->json(['message' => 'Stok pakan ditambahkan', 'data' => $feed]);
    }

    // Add stock to existing feed
    public function addStock(Request $request, $id)
    {
        $tenantId = $this->getTenantId($request);
        $feed = BudidayaFeedStock::where('tenant_id', $tenantId)->findOrFail($id);
        
        $request->validate(['amount_kg' => 'required|numeric|min:0.1']);
        
        $feed->update(['stock_kg' => $feed->stock_kg + $request->amount_kg]);
        
        return response()->json(['message' => 'Stok pakan berhasil diperbarui', 'data' => $feed]);
    }

    // Log a daily feeding
    public function logFeeding(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        $request->validate([
            'cycle_id' => 'required|exists:budidaya_cycles,id',
            'feed_stock_id' => 'required|exists:budidaya_feed_stocks,id',
            'amount_kg' => 'required|numeric|min:0.1',
            'date' => 'required|date'
        ]);

        return DB::transaction(function () use ($request, $tenantId) {
            // Verify feed belongs to tenant
            $feed = BudidayaFeedStock::where('tenant_id', $tenantId)->findOrFail($request->feed_stock_id);

            if ($feed->stock_kg < $request->amount_kg) {
                return response()->json(['message' => 'Stok pakan tidak mencukupi (' . $feed->stock_kg . ' kg tersisa)'], 422);
            }

            // Verify cycle belongs to tenant
            $cycle = \App\Models\BudidayaCycle::where('tenant_id', $tenantId)->findOrFail($request->cycle_id);

            $log = BudidayaFeeding::create([
                'cycle_id' => $cycle->id,
                'feed_stock_id' => $feed->id,
                'amount_kg' => $request->amount_kg,
                'date' => $request->date,
                'notes' => $request->notes
            ]);

            // Deduct stock
            $feed->update(['stock_kg' => $feed->stock_kg - $request->amount_kg]);

            return response()->json(['message' => 'Pemberian pakan dicatat', 'data' => $log]);
        });
    }

    // Delete a feeding log and restore stock
    public function destroyFeedingLog(Request $request, $logId)
    {
        return DB::transaction(function () use ($logId) {
            $log = BudidayaFeeding::findOrFail($logId);
            $feed = BudidayaFeedStock::find($log->feed_stock_id);
            if ($feed) {
                $feed->update(['stock_kg' => $feed->stock_kg + $log->amount_kg]);
            }
            $log->delete();
            return response()->json(['message' => 'Log pakan dihapus']);
        });
    }
}
