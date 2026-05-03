<?php

namespace App\Http\Controllers\Api\Budidaya;

use App\Http\Controllers\Controller;
use App\Models\BudidayaCycle;
use App\Models\BudidayaPond;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BudidayaCycleController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index()
    {
        $cycles = BudidayaCycle::with('pond')->get();
        return response()->json(['data' => $cycles]);
    }

    public function start(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pond_id' => 'required|exists:budidaya_ponds,id',
            'fish_type' => 'required|string',
            'initial_count' => 'required|integer|min:1',
            'initial_cost' => 'required|numeric|min:0',
            'start_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify pond ownership and status
        $pond = BudidayaPond::find($request->pond_id);
        if ($pond->status !== 'kosong' && $pond->status !== 'empty') {
            return response()->json(['message' => 'Kolam masih berisi siklus aktif.'], 422);
        }

        return DB::transaction(function () use ($request, $pond) {
            // 1. Create the cycle
            $cycle = BudidayaCycle::create($request->all() + ['status' => 'active']);

            // 2. Update pond status
            $pond->update(['status' => 'aktif']);

            // 3. Record the initial cost as an EXPENSE in core transaction system
            if ($request->initial_cost > 0) {
                $this->transactionService->createTransaction([
                    'type' => 'expense',
                    'source' => 'budidaya_cycle',
                    'reference_id' => $cycle->id,
                    'amount' => $request->initial_cost,
                    'description' => "Pembelian benih {$request->fish_type} untuk Siklus ID: {$cycle->id}",
                    'date' => $request->start_date
                ]);
            }

            return response()->json([
                'message' => 'Siklus budidaya berhasil dimulai',
                'data' => $cycle->load('pond')
            ], 201);
        });
    }
}
