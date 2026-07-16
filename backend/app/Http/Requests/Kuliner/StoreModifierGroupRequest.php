<?php

namespace App\Http\Requests\Kuliner;

use Illuminate\Foundation\Http\FormRequest;

class StoreModifierGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'is_required' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'options' => ['array'],
            'options.*.id' => ['nullable', 'integer', 'exists:kuliner_modifier_options,id'],
            'options.*.name' => ['required', 'string', 'max:255'],
            'options.*.price_delta' => ['nullable', 'numeric'],
            'options.*.is_default' => ['nullable', 'boolean'],
            'options.*.sort_order' => ['nullable', 'integer'],
        ];
    }
}
