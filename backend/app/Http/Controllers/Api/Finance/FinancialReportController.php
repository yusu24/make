<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Finance\FinancialReportService;

class FinancialReportController extends Controller
{
    protected $reportService;

    public function __construct(FinancialReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function profitLoss(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $tenantId = auth()->user()->tenant_id ?? request()->header('X-Tenant');

        $data = $this->reportService->getProfitAndLoss($startDate, $endDate, $tenantId);
        
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function cashFlow(Request $request)
    {
        $tenantId = auth()->user()->tenant_id ?? request()->header('X-Tenant');
        
        $data = $this->reportService->getCashFlowSummary($tenantId);
        
        return response()->json(['success' => true, 'data' => $data]);
    }
}
