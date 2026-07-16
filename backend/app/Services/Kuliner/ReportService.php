<?php

namespace App\Services\Kuliner;

use App\Models\KulinerExpense;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class ReportService
{
    private function baseOrders(string $tenantId, string $dateFrom, string $dateTo, ?int $kasirId = null)
    {
        $query = Order::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo);

        // 'kasir' filter: this app has no per-order cashier/user column on Order today,
        // so this is a no-op until that relationship exists (flagged in the build plan).
        if ($kasirId) {
            $query->whereRaw('1 = 0');
        }

        return $query;
    }

    /**
     * Sum of (recipe ingredient cost x qty) for every order item with a recipe.
     * Items with no recipe configured contribute 0 (unknown COGS), matching how
     * this app doesn't track COGS at all today outside of Phase 1's recipes.
     */
    private function cogsForOrderIds(array $orderIds): float
    {
        if ($orderIds === []) {
            return 0.0;
        }

        return (float) DB::table('order_items')
            ->join('kuliner_recipe_items', 'order_items.kuliner_product_id', '=', 'kuliner_recipe_items.product_id')
            ->join('kuliner_ingredients', 'kuliner_recipe_items.ingredient_id', '=', 'kuliner_ingredients.id')
            ->whereIn('order_items.order_id', $orderIds)
            ->sum(DB::raw('order_items.qty * kuliner_recipe_items.quantity * kuliner_ingredients.last_price'));
    }

    public function profitLoss(string $tenantId, string $dateFrom, string $dateTo, ?int $kasirId = null): array
    {
        $orders = $this->baseOrders($tenantId, $dateFrom, $dateTo, $kasirId)->get(['id', 'total']);
        $revenue = (float) $orders->sum('total');
        $cogs = $this->cogsForOrderIds($orders->pluck('id')->all());
        $expenses = (float) KulinerExpense::where('tenant_id', $tenantId)
            ->whereDate('date', '>=', $dateFrom)
            ->whereDate('date', '<=', $dateTo)
            ->sum('amount');

        $grossProfit = $revenue - $cogs;

        return [
            'revenue' => $revenue,
            'cogs' => $cogs,
            'gross_profit' => $grossProfit,
            'expenses' => $expenses,
            'net_profit' => $grossProfit - $expenses,
            'order_count' => $orders->count(),
        ];
    }

    public function menuMargin(string $tenantId, string $dateFrom, string $dateTo): array
    {
        $orderIds = $this->baseOrders($tenantId, $dateFrom, $dateTo)->pluck('id');

        $rows = DB::table('order_items')
            ->join('kuliner_products', 'order_items.kuliner_product_id', '=', 'kuliner_products.id')
            ->whereIn('order_items.order_id', $orderIds)
            ->whereNotNull('order_items.kuliner_product_id')
            ->groupBy('kuliner_products.id', 'kuliner_products.name')
            ->select(
                'kuliner_products.id as product_id',
                'kuliner_products.name as product_name',
                DB::raw('SUM(order_items.qty) as qty_sold'),
                DB::raw('SUM(order_items.subtotal) as revenue')
            )
            ->orderByDesc('revenue')
            ->get();

        return $rows->map(function ($row) {
            $cogs = $this->productCogsPerUnit($row->product_id) * (float) $row->qty_sold;
            $margin = (float) $row->revenue - $cogs;

            return [
                'product_id' => $row->product_id,
                'product_name' => $row->product_name,
                'qty_sold' => (float) $row->qty_sold,
                'revenue' => (float) $row->revenue,
                'cogs' => $cogs,
                'margin' => $margin,
                'margin_pct' => $row->revenue > 0 ? round(($margin / $row->revenue) * 100, 1) : null,
            ];
        })->all();
    }

    private function productCogsPerUnit(int $productId): float
    {
        return (float) DB::table('kuliner_recipe_items')
            ->join('kuliner_ingredients', 'kuliner_recipe_items.ingredient_id', '=', 'kuliner_ingredients.id')
            ->where('kuliner_recipe_items.product_id', $productId)
            ->sum(DB::raw('kuliner_recipe_items.quantity * kuliner_ingredients.last_price'));
    }

    private function sellers(string $tenantId, string $dateFrom, string $dateTo, string $direction, int $limit): array
    {
        $orderIds = $this->baseOrders($tenantId, $dateFrom, $dateTo)->pluck('id');

        return DB::table('order_items')
            ->leftJoin('kuliner_products', 'order_items.kuliner_product_id', '=', 'kuliner_products.id')
            ->whereIn('order_items.order_id', $orderIds)
            ->groupBy('order_items.name')
            ->select('order_items.name', DB::raw('SUM(order_items.qty) as qty_sold'), DB::raw('SUM(order_items.subtotal) as revenue'))
            ->orderBy('qty_sold', $direction)
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function bestSellers(string $tenantId, string $dateFrom, string $dateTo, int $limit = 10): array
    {
        return $this->sellers($tenantId, $dateFrom, $dateTo, 'desc', $limit);
    }

    public function worstSellers(string $tenantId, string $dateFrom, string $dateTo, int $limit = 10): array
    {
        return $this->sellers($tenantId, $dateFrom, $dateTo, 'asc', $limit);
    }

    public function salesByHour(string $tenantId, string $dateFrom, string $dateTo): array
    {
        return $this->baseOrders($tenantId, $dateFrom, $dateTo)
            ->select(DB::raw('HOUR(created_at) as bucket'), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as order_count'))
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get()
            ->toArray();
    }

    public function salesByDay(string $tenantId, string $dateFrom, string $dateTo): array
    {
        return $this->baseOrders($tenantId, $dateFrom, $dateTo)
            ->select(DB::raw('DATE(created_at) as bucket'), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as order_count'))
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get()
            ->toArray();
    }

    public function salesByMonth(string $tenantId, string $dateFrom, string $dateTo): array
    {
        return $this->baseOrders($tenantId, $dateFrom, $dateTo)
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bucket"), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as order_count'))
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get()
            ->toArray();
    }
}
