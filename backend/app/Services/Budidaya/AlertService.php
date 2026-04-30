<?php

namespace App\Services\Budidaya;

use App\Models\BudidayaPondSensor;
use App\Models\BudidayaAlert;

class AlertService
{
    // Thresholds can be moved to config() later.
    // Optimal pH: 6.5 - 8.5
    // Optimal Temp: 25 - 32
    protected $thresholds = [
        'ph' => ['min' => 6.5, 'max' => 8.5],
        'temperature' => ['min' => 25.0, 'max' => 32.0],
    ];

    /**
     * Check sensor data against thresholds and create alerts if out of bounds.
     */
    public function checkSensorData(BudidayaPondSensor $sensor)
    {
        $this->evaluateParameter($sensor->pond_id, 'pH', $sensor->ph, $this->thresholds['ph']);
        $this->evaluateParameter($sensor->pond_id, 'Suhu', $sensor->temperature, $this->thresholds['temperature']);
    }

    protected function evaluateParameter($pondId, $parameter, $value, $limits)
    {
        if ($value === null) return;

        if ($value < $limits['min'] || $value > $limits['max']) {
            $status = 'warning';
            
            // Critical if too far off (e.g. 10% tolerance)
            $tolerance = ($limits['max'] - $limits['min']) * 0.1;
            if ($value < ($limits['min'] - $tolerance) || $value > ($limits['max'] + $tolerance)) {
                $status = 'critical';
            }

            BudidayaAlert::create([
                'pond_id' => $pondId,
                'parameter' => $parameter,
                'value' => $value,
                'status' => $status,
                'is_resolved' => false,
            ]);
        } else {
            // Auto-resolve previous alerts for this parameter if it returns to normal
            BudidayaAlert::where('pond_id', $pondId)
                ->where('parameter', $parameter)
                ->where('is_resolved', false)
                ->update(['is_resolved' => true]);
        }
    }
}
