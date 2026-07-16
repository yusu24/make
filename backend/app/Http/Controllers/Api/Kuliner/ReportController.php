<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Services\Kuliner\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reports)
    {
    }

    private function range(Request $request): array
    {
        $to = $request->query('date_to') ?: now()->toDateString();
        $from = $request->query('date_from') ?: now()->subDays(29)->toDateString();

        return [$from, $to];
    }

    public function profitLoss(Request $request)
    {
        [$from, $to] = $this->range($request);
        $kasirId = $request->query('kasir') ? (int) $request->query('kasir') : null;

        return response()->json($this->reports->profitLoss($request->user()->tenant_id, $from, $to, $kasirId));
    }

    public function menuMargin(Request $request)
    {
        [$from, $to] = $this->range($request);

        return response()->json($this->reports->menuMargin($request->user()->tenant_id, $from, $to));
    }

    public function bestSellers(Request $request)
    {
        [$from, $to] = $this->range($request);

        return response()->json($this->reports->bestSellers($request->user()->tenant_id, $from, $to, (int) $request->query('limit', 10)));
    }

    public function worstSellers(Request $request)
    {
        [$from, $to] = $this->range($request);

        return response()->json($this->reports->worstSellers($request->user()->tenant_id, $from, $to, (int) $request->query('limit', 10)));
    }

    public function salesByHour(Request $request)
    {
        [$from, $to] = $this->range($request);

        return response()->json($this->reports->salesByHour($request->user()->tenant_id, $from, $to));
    }

    public function salesByDay(Request $request)
    {
        [$from, $to] = $this->range($request);

        return response()->json($this->reports->salesByDay($request->user()->tenant_id, $from, $to));
    }

    public function salesByMonth(Request $request)
    {
        [$from, $to] = $this->range($request);

        return response()->json($this->reports->salesByMonth($request->user()->tenant_id, $from, $to));
    }
}
