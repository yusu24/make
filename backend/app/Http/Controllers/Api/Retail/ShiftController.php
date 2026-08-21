<?php

namespace App\Http\Controllers\Api\Retail;

use App\Http\Controllers\Controller;
use App\Models\RetailShift;
use App\Services\Retail\ShiftService;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function __construct(private ShiftService $shiftService)
    {
    }

    public function current(Request $request)
    {
        $shift = $this->shiftService->currentOpenShift($request->user()->tenant_id);

        return response()->json(['data' => $shift]);
    }

    public function history(Request $request)
    {
        $shifts = RetailShift::with('user')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderByDesc('opened_at')
            ->paginate(min((int) $request->query('per_page', 15), 100));

        return response()->json($shifts);
    }

    public function open(Request $request)
    {
        $request->validate([
            'opening_cash' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $shift = $this->shiftService->openShift(
                $request->user()->tenant_id,
                $request->user()->id,
                (float) $request->opening_cash,
                $request->note
            );

            return response()->json($shift, 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function close(Request $request, int $id)
    {
        $request->validate([
            'closing_cash' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $shift = RetailShift::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        try {
            $shift = $this->shiftService->closeShift($shift, (float) $request->closing_cash, $request->note);

            return response()->json($shift);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
