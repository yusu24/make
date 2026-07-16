<?php

namespace App\Http\Requests\Kuliner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIngredientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;
        $ingredientId = $this->route('ingredient');

        return [
            'supplier_id' => ['nullable', 'integer', 'exists:kuliner_suppliers,id'],
            'code' => ['nullable', 'string', 'max:100', Rule::unique('kuliner_ingredients', 'code')->where('tenant_id', $tenantId)->ignore($ingredientId)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'unit' => ['sometimes', 'required', 'string', 'max:50'],
            'last_price' => ['nullable', 'numeric', 'min:0'],
            'min_stock' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
