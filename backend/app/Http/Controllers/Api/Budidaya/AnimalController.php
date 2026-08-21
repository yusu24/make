<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use App\Models\BudidayaAnimal;
use App\Models\BudidayaHealth;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnimalController extends Controller
{
    /**
     * List all individual animals for tenant
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $status = $request->query('status');
        $pondId = $request->query('pond_id');
        $category = $request->query('category');
        $gender = $request->query('gender');
        $search = $request->query('search');
        $perPage = (int) $request->query('per_page', 20);

        $query = BudidayaAnimal::where('tenant_id', $tenantId)
            ->with(['pond', 'species', 'father', 'mother']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($pondId) {
            $query->where('pond_id', $pondId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($gender) {
            $query->where('gender', $gender);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('tag_code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('breed', 'like', "%{$search}%")
                  ->orWhere('species_name', 'like', "%{$search}%");
            });
        }

        $animals = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($animals);
    }

    /**
     * Store new individual animal
     */
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'tag_code'          => [
                'required',
                'string',
                'max:100',
                Rule::unique('budidaya_animals')->where('tenant_id', $tenantId),
            ],
            'name'              => 'nullable|string|max:100',
            'pond_id'           => 'nullable|exists:budidaya_ponds,id',
            'cycle_id'          => 'nullable|exists:budidaya_cycles,id',
            'species_id'        => 'nullable|exists:budidaya_species,id',
            'category'          => 'nullable|in:aquaculture,poultry,livestock,bird,other',
            'species_name'      => 'nullable|string|max:150',
            'breed'             => 'nullable|string|max:150',
            'gender'            => 'required|in:male,female,unknown',
            'birth_date'        => 'nullable|date',
            'entry_date'        => 'nullable|date',
            'initial_weight_kg' => 'nullable|numeric|min:0',
            'current_weight_kg' => 'nullable|numeric|min:0',
            'father_id'         => 'nullable|exists:budidaya_animals,id',
            'mother_id'         => 'nullable|exists:budidaya_animals,id',
            'status'            => 'nullable|in:active,breeding,pregnant,quarantine,sick,sold,harvested,deceased,culled',
            'purchase_price'    => 'nullable|numeric|min:0',
            'selling_price'     => 'nullable|numeric|min:0',
            'photo_url'         => 'nullable|string',
            'notes'             => 'nullable|string',
            'metadata'          => 'nullable|array',
        ]);

        $validated['tenant_id'] = $tenantId;
        if (!isset($validated['current_weight_kg']) && isset($validated['initial_weight_kg'])) {
            $validated['current_weight_kg'] = $validated['initial_weight_kg'];
        }

        $animal = BudidayaAnimal::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data hewan individu berhasil didaftarkan',
            'data'    => $animal->load(['pond', 'species', 'father', 'mother']),
        ], 201);
    }

    /**
     * Show single animal with pedigree lineage & health history
     */
    public function show(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $animal = BudidayaAnimal::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->with([
                'pond',
                'species',
                'father.father',
                'father.mother',
                'mother.father',
                'mother.mother',
                'childrenAsFather',
                'childrenAsMother',
                'healthLogs' => function ($q) {
                    $q->orderBy('date', 'desc');
                }
            ])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => $animal,
        ]);
    }

    /**
     * Update animal details
     */
    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $animal = BudidayaAnimal::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $validated = $request->validate([
            'tag_code'          => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('budidaya_animals')->where('tenant_id', $tenantId)->ignore($id),
            ],
            'name'              => 'nullable|string|max:100',
            'pond_id'           => 'nullable|exists:budidaya_ponds,id',
            'cycle_id'          => 'nullable|exists:budidaya_cycles,id',
            'species_id'        => 'nullable|exists:budidaya_species,id',
            'category'          => 'nullable|in:aquaculture,poultry,livestock,bird,other',
            'species_name'      => 'nullable|string|max:150',
            'breed'             => 'nullable|string|max:150',
            'gender'            => 'sometimes|required|in:male,female,unknown',
            'birth_date'        => 'nullable|date',
            'entry_date'        => 'nullable|date',
            'initial_weight_kg' => 'nullable|numeric|min:0',
            'current_weight_kg' => 'nullable|numeric|min:0',
            'father_id'         => 'nullable|exists:budidaya_animals,id',
            'mother_id'         => 'nullable|exists:budidaya_animals,id',
            'status'            => 'nullable|in:active,breeding,pregnant,quarantine,sick,sold,harvested,deceased,culled',
            'purchase_price'    => 'nullable|numeric|min:0',
            'selling_price'     => 'nullable|numeric|min:0',
            'exit_date'         => 'nullable|date',
            'exit_reason'       => 'nullable|string|max:255',
            'photo_url'         => 'nullable|string',
            'notes'             => 'nullable|string',
            'metadata'          => 'nullable|array',
        ]);

        $animal->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data hewan berhasil diperbarui',
            'data'    => $animal->load(['pond', 'species', 'father', 'mother']),
        ]);
    }

    /**
     * Delete animal
     */
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $animal = BudidayaAnimal::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $animal->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data hewan berhasil dihapus',
        ]);
    }

    /**
     * Get pedigree family tree (Silsilah Ayah & Ibu hingga kakek/nenek)
     */
    public function getPedigree(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        $animal = BudidayaAnimal::where('id', $id)
            ->where('tenant_id', $tenantId)
            ->with([
                'father.father',
                'father.mother',
                'mother.father',
                'mother.mother'
            ])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => [
                'individual' => [
                    'id' => $animal->id,
                    'tag_code' => $animal->tag_code,
                    'name' => $animal->name,
                    'breed' => $animal->breed,
                    'gender' => $animal->gender,
                    'birth_date' => $animal->birth_date?->format('Y-m-d'),
                ],
                'parents' => [
                    'sire' => $animal->father ? [
                        'id' => $animal->father->id,
                        'tag_code' => $animal->father->tag_code,
                        'name' => $animal->father->name,
                        'breed' => $animal->father->breed,
                        'paternal_grandsire' => $animal->father->father?->tag_code,
                        'paternal_granddam' => $animal->father->mother?->tag_code,
                    ] : null,
                    'dam' => $animal->mother ? [
                        'id' => $animal->mother->id,
                        'tag_code' => $animal->mother->tag_code,
                        'name' => $animal->mother->name,
                        'breed' => $animal->mother->breed,
                        'maternal_grandsire' => $animal->mother->father?->tag_code,
                        'maternal_granddam' => $animal->mother->mother?->tag_code,
                    ] : null,
                ]
            ]
        ]);
    }
}
