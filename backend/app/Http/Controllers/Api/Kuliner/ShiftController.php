<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Models\KulinerShift;
use App\Services\Kuliner\ShiftService;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function __construct(private ShiftService $shiftService)
    {
    }

    public function current(Request $request)
    {
        $shift = $this->shiftService->currentOpenShift($request->user()->tenant_id);

        // response()->json(null) serializes to "{}" on the wire, which is truthy
        // in JS — return an explicit shape so "no open shift" is unambiguous.
        return response()->json(['data' => $shift]);
    }

    public function history(Request $request)
    {
        $shifts = KulinerShift::with('user')
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

        $shift = KulinerShift::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        try {
            $shift = $this->shiftService->closeShift($shift, (float) $request->closing_cash, $request->note);

            return response()->json($shift);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
