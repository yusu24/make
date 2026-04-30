<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Services\Budidaya\PondService;
use Illuminate\Validation\Rule;
use Exception;

class PondController extends Controller
{
    protected $pondService;

    public function __construct(PondService $pondService)
    {
        $this->pondService = $pondService;
    }

    public function index(Request $request)
    {
        $status = $request->query('status');
        $area = $request->query('area');
        $perPage = $request->query('per_page', 15);

        // Tenant filtering is automatically handled by HasTenant trait
        $query = BudidayaPond::query();

        if ($status) {
            $query->where('status', $status);
        }

        if ($area) {
            $query->where('area', $area);
        }

        $ponds = $query->with('activeCycle')->orderBy('area')->orderBy('name')->paginate($perPage);
        return response()->json($ponds);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'code' => [
                'nullable',
                'string',
                Rule::unique('budidaya_ponds')->where('tenant_id', auth()->user()->tenant_id ?? null)
            ],
            'type' => 'required|string',
            'area' => 'nullable|string',
            'area_m2' => 'nullable|numeric',
            'depth_cm' => 'nullable|numeric',
            'max_fish_count' => 'nullable|numeric',
            'location' => 'nullable|string'
        ]);

        $pond = $this->pondService->createPond($request->all());

        return response()->json(['message' => 'Kolam berhasil ditambahkan', 'data' => $pond]);
    }

    public function show(Request $request, $id)
    {
        $pond = BudidayaPond::findOrFail($id);
        
        // Include summary of active cycle if exists
        $activeCycle = BudidayaCycle::where('pond_id', $pond->id)
            ->where('status', '!=', 'panen')
            ->first();

        return response()->json([
            'data' => $pond,
            'active_cycle' => $activeCycle
        ]);
    }

    public function update(Request $request, $id)
    {
        $pond = BudidayaPond::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string',
            'code' => [
                'required',
                'string',
                Rule::unique('budidaya_ponds')->where('tenant_id', auth()->user()->tenant_id ?? null)->ignore($id)
            ],
            'type' => 'required|string',
            'area' => 'nullable|string',
            'area_m2' => 'nullable|numeric',
            'depth_cm' => 'nullable|numeric',
            'max_fish_count' => 'nullable|numeric',
            'location' => 'nullable|string',
            'status' => 'required|in:kosong,aktif,panen,maintenance'
        ]);

        try {
            $pond = $this->pondService->updatePond($pond, $request->all());
            return response()->json(['message' => 'Data kolam diperbarui', 'data' => $pond]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, $id)
    {
        $pond = BudidayaPond::findOrFail($id);
        
        try {
            $this->pondService->deletePond($pond);
            return response()->json(['message' => 'Kolam berhasil dihapus']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
