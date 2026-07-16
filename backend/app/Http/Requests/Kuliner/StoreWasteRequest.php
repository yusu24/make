<?php

namespace App\Http\Requests\Kuliner;

use Illuminate\Foundation\Http\FormRequest;

class StoreWasteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ingredient_id' => ['required', 'integer', 'exists:kuliner_ingredients,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'reason' => ['required', 'in:expired,damaged,other'],
            'waste_date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
