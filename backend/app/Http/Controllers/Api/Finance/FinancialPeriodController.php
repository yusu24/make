<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FinancialPeriod;

class FinancialPeriodController extends Controller
{
    public function index(Request $request)
    {
        $periods = FinancialPeriod::orderBy('period_name', 'desc')->get();
        return response()->json(['success' => true, 'data' => $periods]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'period_name' => 'required|string', // e.g. 2026-01
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $period = FinancialPeriod::create($validated);
        return response()->json(['success' => true, 'message' => 'Period created', 'data' => $period]);
    }

    public function closePeriod($id)
    {
        $period = FinancialPeriod::findOrFail($id);
        
        if ($period->status === 'closed') {
            return response()->json(['success' => false, 'message' => 'Period is already closed'], 400);
        }

        $period->status = 'closed';
        $period->closed_by = auth()->id();
        $period->closed_at = now();
        $period->save();

        return response()->json(['success' => true, 'message' => 'Period closed successfully', 'data' => $period]);
    }
}
