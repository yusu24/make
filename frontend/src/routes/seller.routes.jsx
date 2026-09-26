/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, CategoryRoute } from './guards';

const SellerLayout = lazy(() => import('../apps/seller/repo/SellerApp'));

// Omnichannel Pages
const SellerDashboard = lazy(() => import('../apps/seller/repo/pages/SellerDashboardPage'));
const SellerOrders = lazy(() => import('../apps/seller/repo/pages/SellerOrdersPage'));
const MarketplaceDashboard = lazy(() => import('../apps/seller/repo/pages/SellerMarketplaceDashboardPage'));
const ConnectedAccounts = lazy(() => import('../apps/seller/repo/components/omnichannel/ConnectedAccountsView').then(m => ({ default: m.ConnectedAccountsView })));
const ProductMapping = lazy(() => import('../apps/seller/repo/components/omnichannel/ProductMappingView').then(m => ({ default: m.ProductMappingView })));
const SyncCenter = lazy(() => import('../apps/seller/repo/components/omnichannel/SyncCenterView').then(m => ({ default: m.SyncCenterView })));
const SyncHistory = lazy(() => import('../apps/seller/repo/components/omnichannel/SyncHistoryView').then(m => ({ default: m.SyncHistoryView })));
const ShippingDashboard = lazy(() => import('../apps/seller/repo/components/omnichannel/ShippingDashboardView').then(m => ({ default: m.ShippingDashboardView })));
const ShippingManagement = lazy(() => import('../apps/seller/repo/components/omnichannel/ShippingManagementView').then(m => ({ default: m.ShippingManagementView })));
const PackingImprovement = lazy(() => import('../apps/seller/repo/components/omnichannel/PackingImprovementView').then(m => ({ default: m.PackingImprovementView })));
const NotificationCenter = lazy(() => import('../apps/seller/repo/components/omnichannel/NotificationCenterView').then(m => ({ default: m.NotificationCenterView })));

// Retail Pages connected into Seller
const RetailPos = lazy(() => import('../apps/retail/pages/Pos'));
const RetailProducts = lazy(() => import('../apps/retail/pages/Products'));
const RetailCategories = lazy(() => import('../apps/retail/pages/Categories'));
const RetailUnits = lazy(() => import('../apps/retail/pages/Units'));
const RetailBatches = lazy(() => import('../apps/retail/pages/Batches'));
const RetailSerials = lazy(() => import('../apps/retail/pages/Serials'));
const RetailPrintLabels = lazy(() => import('../apps/retail/pages/PrintLabels'));
const RetailDiscounts = lazy(() => import('../apps/retail/pages/Discounts'));
const RetailPricelists = lazy(() => import('../apps/retail/pages/Pricelists'));
const RetailCustomers = lazy(() => import('../apps/retail/pages/Customers'));
const RetailSuppliers = lazy(() => import('../apps/retail/pages/Suppliers'));
const RetailOutlets = lazy(() => import('../apps/retail/pages/Outlets'));

const RetailInventory = lazy(() => import('../apps/retail/pages/Inventory'));
const RetailPurchaseOrders = lazy(() => import('../apps/retail/pages/PurchaseOrders'));
const RetailStockEntry = lazy(() => import('../apps/retail/pages/StockEntry'));
const RetailStockMovements = lazy(() => import('../apps/retail/pages/StockMovements'));
const RetailStockTransfers = lazy(() => import('../apps/retail/pages/StockTransfers'));
const RetailStockOpname = lazy(() => import('../apps/retail/pages/StockOpname'));
const RetailSupplierReturns = lazy(() => import('../apps/retail/pages/SupplierReturns'));
const RetailCustomerReturns = lazy(() => import('../apps/retail/pages/CustomerReturns'));

const RetailTransactions = lazy(() => import('../apps/retail/pages/Transactions'));
const RetailShifts = lazy(() => import('../apps/retail/pages/Shifts'));

const RetailFinanceSummary = lazy(() => import('../apps/retail/pages/FinanceSummary'));
const RetailCashTransactions = lazy(() => import('../apps/retail/pages/CashTransactions'));
const RetailPayables = lazy(() => import('../apps/retail/pages/Payables'));
const RetailReceivables = lazy(() => import('../apps/retail/pages/Receivables'));
const RetailCashTransfers = lazy(() => import('../apps/retail/pages/CashTransfers'));
const RetailCashFlow = lazy(() => import('../apps/retail/pages/CashFlow'));
const RetailTaxReport = lazy(() => import('../apps/retail/pages/TaxReport'));
const RetailFinanceCategories = lazy(() => import('../apps/retail/pages/FinanceCategories'));

const RetailSalesReport = lazy(() => import('../apps/retail/pages/SalesReport'));
const RetailProductReport = lazy(() => import('../apps/retail/pages/ProductReport'));
const RetailProductMarginReport = lazy(() => import('../apps/retail/pages/ProductMarginReport'));
const RetailCustomerReport = lazy(() => import('../apps/retail/pages/CustomerReport'));
const RetailConsignment = lazy(() => import('../apps/retail/pages/Consignment'));
const RetailShiftReport = lazy(() => import('../apps/retail/pages/ShiftReport'));
const RetailPaymentReport = lazy(() => import('../apps/retail/pages/PaymentReport'));

const RetailStaff = lazy(() => import('../apps/retail/pages/Staff'));
const RetailRoles = lazy(() => import('../apps/retail/pages/Roles'));
const RetailSettings = lazy(() => import('../apps/retail/pages/Settings'));
const RetailGuide = lazy(() => import('../apps/retail/pages/RetailGuide'));
const RetailSubscription = lazy(() => import('../apps/retail/pages/Subscription'));
const TenantSupportCenter = lazy(() => import('../pages/TenantSupportCenter'));
const RetailDeveloperApi = lazy(() => import('../apps/retail/pages/RetailDeveloperApi'));
const RetailBackup = lazy(() => import('../apps/retail/pages/RetailBackup'));

const sellerRoutes = (
  <Route
    path="/seller"
    element={
      <ProtectedRoute>
        <CategoryRoute allowedCategory={['Seller', 'Toko Retail']}>
          <SellerLayout />
        </CategoryRoute>
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<SellerDashboard />} />
    <Route path="pos" element={<RetailPos />} />
    <Route path="orders" element={<SellerOrders />} />

    {/* OMNICHANNEL MARKETPLACE */}
    <Route path="marketplace" element={<MarketplaceDashboard />} />
    <Route path="marketplace/connected" element={<ConnectedAccounts />} />
    <Route path="marketplace/mapping" element={<ProductMapping />} />
    <Route path="marketplace/sync" element={<SyncCenter />} />
    <Route path="marketplace/history" element={<SyncHistory />} />
    <Route path="shipping/dashboard" element={<ShippingDashboard />} />
    <Route path="shipping/management" element={<ShippingManagement />} />
    <Route path="shipping/packing" element={<PackingImprovement />} />
    <Route path="notifications" element={<NotificationCenter />} />

    {/* DATA MASTER & KATALOG */}
    <Route path="products" element={<RetailProducts />} />
    <Route path="categories" element={<RetailCategories />} />
    <Route path="units" element={<RetailUnits />} />
    <Route path="batches" element={<RetailBatches />} />
    <Route path="serials" element={<RetailSerials />} />
    <Route path="print-labels" element={<RetailPrintLabels />} />
    <Route path="discounts" element={<RetailDiscounts />} />
    <Route path="pricelists" element={<RetailPricelists />} />
    <Route path="customers" element={<RetailCustomers />} />
    <Route path="suppliers" element={<RetailSuppliers />} />
    <Route path="outlets" element={<RetailOutlets />} />

    {/* LOGISTIK & GUDANG */}
    <Route path="inventory" element={<RetailInventory />} />
    <Route path="warehouses" element={<Navigate to="/seller/outlets" replace />} />
    <Route path="purchase-orders" element={<RetailPurchaseOrders />} />
    <Route path="stock" element={<RetailStockEntry />} />
    <Route path="stock-movements" element={<RetailStockMovements />} />
    <Route path="stock-transfers" element={<RetailStockTransfers />} />
    <Route path="stock-opname" element={<RetailStockOpname />} />
    <Route path="supplier-returns" element={<RetailSupplierReturns />} />
    <Route path="customer-returns" element={<RetailCustomerReturns />} />

    {/* TRANSAKSI & KASIR */}
    <Route path="transactions" element={<RetailTransactions />} />
    <Route path="shifts" element={<RetailShifts />} />

    {/* KEUANGAN */}
    <Route path="finance">
      <Route index element={<Navigate to="summary" replace />} />
      <Route path="summary" element={<RetailFinanceSummary />} />
      <Route path="cash" element={<RetailCashTransactions />} />
      <Route path="payables" element={<RetailPayables />} />
      <Route path="receivables" element={<RetailReceivables />} />
      <Route path="transfers" element={<RetailCashTransfers />} />
      <Route path="cash-flow" element={<RetailCashFlow />} />
      <Route path="tax-report" element={<RetailTaxReport />} />
    </Route>
    <Route path="finance-categories" element={<RetailFinanceCategories />} />

    {/* LAPORAN */}
    <Route path="reports">
      <Route index element={<Navigate to="sales" replace />} />
      <Route path="sales" element={<RetailSalesReport />} />
      <Route path="products" element={<RetailProductReport />} />
      <Route path="margins" element={<RetailProductMarginReport />} />
      <Route path="customers" element={<RetailCustomerReport />} />
      <Route path="consignment" element={<RetailConsignment />} />
      <Route path="shifts" element={<RetailShiftReport />} />
      <Route path="payments" element={<RetailPaymentReport />} />
    </Route>

    {/* PENGATURAN & SISTEM */}
    <Route path="staff" element={<RetailStaff />} />
    <Route path="roles" element={<RetailRoles />} />
    <Route path="settings" element={<RetailSettings />} />
    <Route path="subscription" element={<RetailSubscription />} />
    <Route path="support" element={<TenantSupportCenter />} />
    <Route path="developer-api" element={<RetailDeveloperApi />} />
    <Route path="guide" element={<RetailGuide />} />
    <Route path="backup" element={<RetailBackup />} />

    {/* ROUTE ALIASES FOR COMPATIBILITY */}
    <Route path="purchases" element={<Navigate to="/seller/purchase-orders" replace />} />
    <Route path="incomes" element={<Navigate to="/seller/finance/cash" replace />} />
    <Route path="expenses" element={<Navigate to="/seller/finance/cash" replace />} />
    <Route path="sales-report" element={<Navigate to="/seller/reports/sales" replace />} />
    <Route path="settings/app" element={<Navigate to="/seller/settings" replace />} />
    <Route path="settings/account" element={<Navigate to="/seller/settings" replace />} />
    <Route path="settings/roles" element={<Navigate to="/seller/roles" replace />} />
    <Route path="settings/users" element={<Navigate to="/seller/staff" replace />} />
  </Route>
);

export default sellerRoutes;
