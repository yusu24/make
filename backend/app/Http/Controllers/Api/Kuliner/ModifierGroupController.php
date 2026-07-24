<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\StoreModifierGroupRequest;
use App\Models\KulinerModifierGroup;
use App\Models\KulinerModifierOption;
use App\Models\KulinerProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModifierGroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = KulinerModifierGroup::with('options')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('sort_order')
            ->get();

        return response()->json($groups);
    }

    public function store(StoreModifierGroupRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $group = KulinerModifierGroup::create([
                'tenant_id' => $request->user()->tenant_id,
                'name' => $request->name,
                'is_required' => $request->boolean('is_required'),
                'sort_order' => $request->input('sort_order', 0),
                'is_active' => $request->input('is_active', true),
            ]);

            $this->syncOptions($group, $request->input('options', []));

            return response()->json($group->fresh('options'), 201);
        });
    }

    public function update(StoreModifierGroupRequest $request, int $id)
    {
        $group = KulinerModifierGroup::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        return DB::transaction(function () use ($request, $group) {
            $group->update([
                'name' => $request->name,
                'is_required' => $request->boolean('is_required'),
                'sort_order' => $request->input('sort_order', 0),
                'is_active' => $request->input('is_active', true),
            ]);

            $this->syncOptions($group, $request->input('options', []));

            return response()->json($group->fresh('options'));
        });
    }

    public function destroy(Request $request, int $id)
    {
        $group = KulinerModifierGroup::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $group->delete();

        return response()->json(['message' => 'Modifier group dihapus']);
    }

    public function attachToProduct(Request $request, int $product, int $group)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($product);
        $group = KulinerModifierGroup::where('tenant_id', $request->user()->tenant_id)->findOrFail($group);

        $product->modifierGroups()->syncWithoutDetaching([$group->id]);

        return response()->json(['message' => 'Modifier group terpasang ke produk']);
    }

    public function detachFromProduct(Request $request, int $product, int $group)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($product);
        $product->modifierGroups()->detach($group);

        return response()->json(['message' => 'Modifier group dilepas dari produk']);
    }

    private function syncOptions(KulinerModifierGroup $group, array $options): void
    {
        $existing = $group->options()->get()->keyBy('id');
        $keepIds = [];

        foreach ($options as $index => $option) {
            $attributes = [
                'modifier_group_id' => $group->id,
                'name' => $option['name'],
                'price_delta' => $option['price_delta'] ?? 0,
                'is_default' => $option['is_default'] ?? false,
                'sort_order' => $option['sort_order'] ?? $index,
                'is_active' => true,
            ];

            $record = !empty($option['id']) ? $existing->get($option['id']) : null;
            if ($record) {
                $record->update($attributes);
            } else {
                $record = $group->options()->create($attributes);
            }

            $keepIds[] = $record->id;
        }

        $group->options()->whereNotIn('id', $keepIds)->delete();
    }
}
