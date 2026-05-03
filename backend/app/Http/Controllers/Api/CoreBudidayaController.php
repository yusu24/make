<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pond;
use App\Models\Cycle;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CoreBudidayaController extends Controller
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function storePond(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'size' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pond = Pond::create($request->all());

        return response()->json(['message' => 'Kolam berhasil dibuat', 'data' => $pond], 201);
    }

    public function storeCycle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pond_id' => 'required|exists:ponds,id',
            'start_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cycle = Cycle::create($request->all() + ['status' => 'active']);

        return response()->json(['message' => 'Siklus berhasil dimulai', 'data' => $cycle], 201);
    }

    public function storeExpense(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cycle_id' => 'required|exists:cycles,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $transaction = $this->transactionService->createTransaction([
            'type' => 'expense',
            'source' => 'budidaya_expense',
            'reference_id' => $request->cycle_id,
            'amount' => $request->amount,
            'description' => "Biaya Budidaya: {$request->description} (Siklus ID: {$request->cycle_id})",
            'date' => $request->date,
        ]);

        return response()->json(['message' => 'Biaya berhasil dicatat', 'data' => $transaction], 201);
    }

    public function storeHarvest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cycle_id' => 'required|exists:cycles,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $transaction = $this->transactionService->createTransaction([
            'type' => 'income',
            'source' => 'budidaya_harvest',
            'reference_id' => $request->cycle_id,
            'amount' => $request->amount,
            'description' => $request->description ?? "Panen Budidaya (Siklus ID: {$request->cycle_id})",
            'date' => $request->date,
        ]);

        // Mark cycle as finished
        $cycle = Cycle::find($request->cycle_id);
        $cycle->update(['status' => 'finished', 'end_date' => $request->date]);

        return response()->json(['message' => 'Panen berhasil dicatat dan siklus selesai', 'data' => $transaction], 201);
    }
}
