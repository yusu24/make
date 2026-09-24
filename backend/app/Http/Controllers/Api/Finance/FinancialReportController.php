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

    private function getTenantId(Request $request): string
    {
        $tenantId = $request->attributes->get('tenant_id') ?? $request->user()?->tenant_id;
        if (empty($tenantId)) {
            abort(response()->json(['message' => 'Unauthorized: No Tenant ID associated with this user.'], 403));
        }
        return $tenantId;
    }

    public function profitLoss(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $tenantId = $this->getTenantId($request);

        $data = $this->reportService->getProfitAndLoss($startDate, $endDate, $tenantId);
        
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function cashFlow(Request $request)
    {
        $tenantId = $this->getTenantId($request);
        
        $data = $this->reportService->getCashFlowSummary($tenantId);
        
        return response()->json(['success' => true, 'data' => $data]);
    }
}
