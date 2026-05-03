import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

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

const retailRoutes = (
  <Route path="retail">
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<RetailDashboard />} />
    <Route path="pos" element={<RetailPos />} />

    {/* DATA MASTER */}
    <Route path="products" element={<RetailProducts />} />
    <Route path="inventory" element={<RetailInventory />} />
    <Route path="stock" element={<RetailStockEntry />} />
    <Route path="categories" element={<RetailCategories />} />
    <Route path="units" element={<RetailUnits />} />
    <Route path="suppliers" element={<RetailSuppliers />} />
    <Route path="customers" element={<RetailCustomers />} />
    <Route path="expense-categories" element={<RetailExpenseCategories />} />
    <Route path="staff" element={<RetailStaff />} />
    <Route path="roles" element={<RetailRoles />} />
    <Route path="subscription" element={<RetailSubscription />} />

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
    </Route>
  </Route>
);

export default retailRoutes;
