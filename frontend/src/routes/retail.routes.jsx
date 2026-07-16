/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { CategoryRoute } from './guards';

// Custom wrapper to forward the parent Outlet context down to child routes
const RetailOutlet = () => {
  const context = useOutletContext();
  return <Outlet context={context} />;
};

const RetailDashboard = lazy(() => import('../apps/retail/pages/Dashboard'));
const RetailProducts = lazy(() => import('../apps/retail/pages/Products'));
const RetailPos = lazy(() => import('../apps/retail/pages/Pos'));
const RetailCategories = lazy(() => import('../apps/retail/pages/Categories'));
const RetailExpenseCategories = lazy(() => import('../apps/retail/pages/ExpenseCategories'));
const RetailSuppliers = lazy(() => import('../apps/retail/pages/Suppliers'));
const RetailCustomers = lazy(() => import('../apps/retail/pages/Customers'));
const RetailStaff = lazy(() => import('../apps/retail/pages/Staff'));
const RetailRoles = lazy(() => import('../apps/retail/pages/Roles'));
const RetailSubscription = lazy(() => import('../apps/retail/pages/Subscription'));
const RetailSalesReport = lazy(() => import('../apps/retail/pages/SalesReport'));
const RetailProductReport = lazy(() => import('../apps/retail/pages/ProductReport'));
const RetailCustomerReport = lazy(() => import('../apps/retail/pages/CustomerReport'));
const RetailStockEntry = lazy(() => import('../apps/retail/pages/StockEntry'));
const RetailUnits = lazy(() => import('../apps/retail/pages/Units'));
const RetailInventory = lazy(() => import('../apps/retail/pages/Inventory'));
const RetailFinanceSummary = lazy(() => import('../apps/retail/pages/FinanceSummary'));
const RetailExpenses = lazy(() => import('../apps/retail/pages/Expenses'));
const TenantSupportCenter = lazy(() => import('../pages/TenantSupportCenter'));
const RetailProfile = lazy(() => import('../apps/retail/pages/Profile'));
const RetailStockMovements = lazy(() => import('../apps/retail/pages/StockMovements'));
const RetailSupplierReturns = lazy(() => import('../apps/retail/pages/SupplierReturns'));
const RetailCustomerReturns = lazy(() => import('../apps/retail/pages/CustomerReturns'));
const RetailDiscounts = lazy(() => import('../apps/retail/pages/Discounts'));
const RetailPricelists = lazy(() => import('../apps/retail/pages/Pricelists'));
const RetailPayables = lazy(() => import('../apps/retail/pages/Payables'));
const RetailReceivables = lazy(() => import('../apps/retail/pages/Receivables'));
const RetailStockOpname = lazy(() => import('../apps/retail/pages/StockOpname'));
const RetailTransactions = lazy(() => import('../apps/retail/pages/Transactions'));
const RetailSettings = lazy(() => import('../apps/retail/pages/Settings'));

const retailRoutes = (
  <Route path="retail" element={<CategoryRoute allowedCategory="Toko Retail"><RetailOutlet /></CategoryRoute>}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<RetailDashboard />} />
    <Route path="pos" element={<RetailPos />} />

    {/* DATA MASTER */}
    <Route path="products" element={<RetailProducts />} />
    <Route path="inventory" element={<RetailInventory />} />
    <Route path="stock" element={<RetailStockEntry />} />
    <Route path="stock-movements" element={<RetailStockMovements />} />
    <Route path="stock-opname" element={<RetailStockOpname />} />
    <Route path="categories" element={<RetailCategories />} />
    <Route path="units" element={<RetailUnits />} />
    <Route path="suppliers" element={<RetailSuppliers />} />
    <Route path="customers" element={<RetailCustomers />} />
    <Route path="expense-categories" element={<RetailExpenseCategories />} />
    <Route path="staff" element={<RetailStaff />} />
    <Route path="roles" element={<RetailRoles />} />
    <Route path="subscription" element={<RetailSubscription />} />
    <Route path="support" element={<TenantSupportCenter />} />
    <Route path="profile" element={<RetailProfile />} />
    <Route path="settings" element={<RetailSettings />} />

    {/* TRANSAKSI & RETUR */}
    <Route path="transactions" element={<RetailTransactions />} />
    <Route path="supplier-returns" element={<RetailSupplierReturns />} />
    <Route path="customer-returns" element={<RetailCustomerReturns />} />
    <Route path="discounts" element={<RetailDiscounts />} />
    <Route path="pricelists" element={<RetailPricelists />} />

    {/* LAPORAN */}
    <Route path="reports">
      <Route index element={<Navigate to="sales" replace />} />
      <Route path="sales" element={<RetailSalesReport />} />
      <Route path="products" element={<RetailProductReport />} />
      <Route path="customers" element={<RetailCustomerReport />} />
    </Route>

    {/* KEUANGAN */}
    <Route path="finance">
      <Route index element={<Navigate to="summary" replace />} />
      <Route path="summary" element={<RetailFinanceSummary />} />
      <Route path="expenses" element={<RetailExpenses />} />
      <Route path="payables" element={<RetailPayables />} />
      <Route path="receivables" element={<RetailReceivables />} />
    </Route>
  </Route>
);

export default retailRoutes;
