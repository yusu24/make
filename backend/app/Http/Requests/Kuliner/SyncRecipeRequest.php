<?php

namespace App\Http\Requests\Kuliner;

use Illuminate\Foundation\Http\FormRequest;

class SyncRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['array'],
            'items.*.ingredient_id' => ['required', 'integer', 'exists:kuliner_ingredients,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
