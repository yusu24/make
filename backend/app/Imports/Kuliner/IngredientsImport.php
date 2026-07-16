<?php

namespace App\Imports\Kuliner;

use App\Models\KulinerIngredient;
use App\Models\KulinerSupplier;
use App\Services\Kuliner\IngredientStockService;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Validators\Failure;

class IngredientsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    private int $created = 0;
    private int $updated = 0;
    private int $stockIgnoredOnUpdate = 0;
    /** @var Failure[] */
    private array $failures = [];

    public function __construct(private string $tenantId, private IngredientStockService $stock)
    {
    }

    public function model(array $row)
    {
        $code = trim((string) ($row['kode'] ?? ''));
        $name = trim((string) ($row['nama'] ?? ''));

        if ($name === '') {
            return null;
        }

        $supplierId = null;
        if (!empty($row['supplier'])) {
            $supplierId = KulinerSupplier::where('tenant_id', $this->tenantId)
                ->where('name', trim($row['supplier']))
                ->value('id');
        }

        $existing = $code !== ''
            ? KulinerIngredient::where('tenant_id', $this->tenantId)->where('code', $code)->first()
            : null;

        $masterData = [
            'tenant_id' => $this->tenantId,
            'code' => $code ?: null,
            'name' => $name,
            'category' => $row['kategori'] ?? null,
            'supplier_id' => $supplierId,
            'unit' => $row['satuan'] ?? 'pcs',
            'last_price' => (float) ($row['harga_terakhir'] ?? 0),
            'min_stock' => (float) ($row['stok_minimum'] ?? 0),
        ];

        if ($existing) {
            // Import never silently overwrites live stock on an existing row.
            $existing->update($masterData);
            if (isset($row['stok_saat_ini'])) {
                $this->stockIgnoredOnUpdate++;
            }
            $this->updated++;

            return null;
        }

        $ingredient = KulinerIngredient::create($masterData + ['stock' => 0]);
        $this->created++;

        $initialStock = (float) ($row['stok_saat_ini'] ?? 0);
        if ($initialStock > 0) {
            $this->stock->addStock($ingredient, $initialStock, null, 'Import awal');
        }

        return null;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string'],
            'satuan' => ['nullable', 'string'],
        ];
    }

    public function onFailure(Failure ...$failures): void
    {
        $this->failures = array_merge($this->failures, $failures);
    }

    public function summary(): array
    {
        return [
            'created' => $this->created,
            'updated' => $this->updated,
            'skipped_stock_warnings' => $this->stockIgnoredOnUpdate,
            'failures' => count($this->failures),
        ];
    }
}
