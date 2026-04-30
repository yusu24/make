<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaPondSensor;
use App\Services\Budidaya\AlertService;

class SensorController extends Controller
{
    protected $alertService;

    public function __construct(AlertService $alertService)
    {
        $this->alertService = $alertService;
    }

    public function store(Request $request, $pondId)
    {
        $pond = BudidayaPond::findOrFail($pondId);

        $validated = $request->validate([
            'ph' => 'nullable|numeric|between:0,14',
            'temperature' => 'nullable|numeric|between:0,50',
            'do' => 'nullable|numeric|between:0,20',
            'salinity' => 'nullable|numeric|between:0,50',
            'recorded_at' => 'nullable|date',
        ]);

        $sensor = BudidayaPondSensor::create(array_merge($validated, [
            'pond_id' => $pond->id,
            'recorded_at' => $validated['recorded_at'] ?? now(),
        ]));

        // Trigger Alert Service
        $this->alertService->checkSensorData($sensor);

        return response()->json(['message' => 'Sensor data recorded successfully', 'data' => $sensor]);
    }
}
