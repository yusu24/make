<?php

namespace App\Http\Requests\Kuliner;

use Illuminate\Foundation\Http\FormRequest;

class StoreTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:50',
            'capacity' => 'nullable|integer|min:1|max:100',
            'position_x' => 'nullable|integer',
            'position_y' => 'nullable|integer',
        ];
    }
}
