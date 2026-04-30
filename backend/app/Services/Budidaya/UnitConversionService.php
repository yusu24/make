<?php

namespace App\Services\Budidaya;

use Exception;

class UnitConversionService
{
    /**
     * Convert an input amount to the standard unit (Kilogram).
     * The conversions are defined in config/budidaya.php
     *
     * @param float $amount
     * @param string $unit The input unit (e.g. 'karung', 'gram', 'kg', 'kilogram')
     * @return float The converted amount in Kilograms
     */
    public function convertToStandardUnit(float $amount, string $unit): float
    {
        $unit = strtolower(trim($unit));

        // If it's already the standard unit, return as is
        if (in_array($unit, ['kg', 'kilogram', 'kilograms'])) {
            return $amount;
        }

        $conversions = config('budidaya.unit_conversions', []);

        if (array_key_exists($unit, $conversions)) {
            return $amount * $conversions[$unit];
        }

        // If no conversion is defined, assume the user might have misspelled, 
        // throw an exception or just return the amount. We throw exception to prevent data corruption.
        throw new Exception("Sistem tidak mengenali satuan '{$unit}'. Tidak dapat melakukan konversi.");
    }
}
