<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OmnichannelController extends Controller
{
    /**
     * Get marketplace accounts.
     */
    public function getAccounts(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    /**
     * Get product mappings.
     */
    public function getProductMappings(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    /**
     * Trigger global sync.
     */
    public function triggerSync(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Sync triggered successfully.'
        ]);
    }

    /**
     * Get shipments.
     */
    public function getShipments(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }
}
