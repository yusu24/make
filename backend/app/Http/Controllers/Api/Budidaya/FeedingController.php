<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaCycle;
use App\Services\Budidaya\FeedingService;
use App\Services\Budidaya\UnitConversionService;
use Exception;

class FeedingController extends Controller
{
    protected $feedingService;
    protected $unitConversionService;

    public function __construct(FeedingService $feedingService, UnitConversionService $unitConversionService)
    {
        $this->feedingService = $feedingService;
        $this->unitConversionService = $unitConversionService;
    }

    public function store(Request $request, $cycleId)
    {
        // Find cycle (tenant_id is filtered implicitly by HasTenant if cycle had it, but here it's via Pond)
        // Wait, BudidayaCycle has tenant_id directly!
        $cycle = BudidayaCycle::findOrFail($cycleId);

        $validated = $request->validate([
            'inventory_id' => 'required|exists:budidaya_inventories,id',
            'amount' => 'required|numeric|min:0.01',
            'unit' => 'nullable|string|max:50',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        try {
            // Apply Unit Conversion
            $inputUnit = $validated['unit'] ?? 'kg';
            $amountKg = $this->unitConversionService->convertToStandardUnit($validated['amount'], $inputUnit);
            
            // Prepare data for FeedingService
            $feedingData = [
                'inventory_id' => $validated['inventory_id'],
                'amount_kg' => $amountKg,
                'date' => $validated['date'],
                'notes' => $validated['notes'],
                'original_input' => $validated['amount'] . ' ' . $inputUnit // Optional: could be saved in notes if needed
            ];

            $this->feedingService->recordFeeding($cycle, $feedingData);
            return response()->json(['message' => 'Pemberian pakan berhasil dicatat']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
