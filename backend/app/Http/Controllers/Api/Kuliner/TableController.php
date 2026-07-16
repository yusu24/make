<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\StoreTableRequest;
use App\Models\KulinerTable;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $tables = KulinerTable::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json($tables);
    }

    public function store(StoreTableRequest $request)
    {
        $table = KulinerTable::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $request->name,
            'capacity' => $request->input('capacity', 4),
            'position_x' => $request->input('position_x', 0),
            'position_y' => $request->input('position_y', 0),
        ]);

        return response()->json($table, 201);
    }

    public function update(StoreTableRequest $request, int $id)
    {
        $table = KulinerTable::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $table->update([
            'name' => $request->name,
            'capacity' => $request->input('capacity', $table->capacity),
            'position_x' => $request->input('position_x', $table->position_x),
            'position_y' => $request->input('position_y', $table->position_y),
        ]);

        return response()->json($table);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => ['required', Rule::in(['empty', 'occupied', 'reserved', 'cleaning'])],
        ]);

        $table = KulinerTable::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $table->update(['status' => $request->status]);

        return response()->json($table);
    }

    public function destroy(Request $request, int $id)
    {
        $table = KulinerTable::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $table->delete();

        return response()->json(['message' => 'Meja dihapus']);
    }
}
