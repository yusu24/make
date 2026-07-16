/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Route, Outlet } from 'react-router-dom';
import { ProtectedRoute, CategoryRoute } from './guards';
import KulinerAdminLayout from '../apps/kuliner/components/KulinerAdminLayout';

const KulinerAdminMenu = lazy(() => import('../apps/kuliner/pages/AdminMenu'));
const KulinerAdminSettings = lazy(() => import('../apps/kuliner/pages/AdminSettings'));
const KulinerCategoryStorefront = lazy(() => import('../apps/kuliner/pages/CategoryStorefront'));
const KulinerFullMenu = lazy(() => import('../apps/kuliner/pages/FullMenu'));
const KulinerDashboard = lazy(() => import('../apps/kuliner/pages/KulinerDashboard'));
const KulinerOrders = lazy(() => import('../apps/kuliner/pages/KulinerOrders'));
const KulinerReports = lazy(() => import('../apps/kuliner/pages/SalesReport'));
const KulinerAnalytics = lazy(() => import('../apps/kuliner/pages/CulinaryAnalytics'));
const KulinerTransactions = lazy(() => import('../apps/kuliner/pages/CulinaryTransactions'));
const KulinerStaff = lazy(() => import('../apps/kuliner/pages/CulinaryStaff'));
const KulinerRoles = lazy(() => import('../apps/kuliner/pages/CulinaryRoles'));
const KulinerProfile = lazy(() => import('../apps/kuliner/pages/CulinaryProfile'));
const KulinerSubscription = lazy(() => import('../apps/kuliner/pages/Subscription'));
const KulinerSupport = lazy(() => import('../apps/kuliner/pages/CulinarySupport'));

// Phase 1: Menu engineering (Bahan Baku, Recipe/BOM, Modifier, Add-on, Bundle)
const KulinerBahanBaku = lazy(() => import('../apps/kuliner/pages/BahanBaku'));
const KulinerRecipes = lazy(() => import('../apps/kuliner/pages/Recipes'));
const KulinerModifiers = lazy(() => import('../apps/kuliner/pages/Modifiers'));
const KulinerAddons = lazy(() => import('../apps/kuliner/pages/Addons'));
const KulinerBundles = lazy(() => import('../apps/kuliner/pages/Bundles'));

// Phase 2: Order lifecycle & kitchen operations
const KulinerKitchenQueue = lazy(() => import('../apps/kuliner/pages/KitchenQueue'));
const KulinerShift = lazy(() => import('../apps/kuliner/pages/Shift'));

// Phase 3: Stock operations & loss tracking
const KulinerStockOpname = lazy(() => import('../apps/kuliner/pages/StockOpnameBahanBaku'));
const KulinerWaste = lazy(() => import('../apps/kuliner/pages/Waste'));

// Phase 4: Reporting
const KulinerAdvancedReports = lazy(() => import('../apps/kuliner/pages/KulinerReports'));

// Phase 5: Table management (dine-in / QR self order)
const KulinerTables = lazy(() => import('../apps/kuliner/pages/Tables'));

const kulinerRoutes = (
  <Route path="/kuliner">
    <Route index element={<KulinerCategoryStorefront />} />
    <Route path="menu" element={<KulinerFullMenu />} />
    
    {/* Protected Culinary Admin / Operational Routes */}
    <Route element={<ProtectedRoute><CategoryRoute allowedCategory="Kuliner"><Outlet /></CategoryRoute></ProtectedRoute>}>
      <Route path="admin" element={<KulinerDashboard />} />
      <Route path="admin/orders" element={<KulinerOrders />} />
      <Route path="admin/categories" element={<KulinerAdminMenu />} />
      <Route path="admin/reports" element={<KulinerReports />} />
      <Route path="admin/analytics" element={<KulinerAnalytics />} />
      <Route path="admin/transactions" element={<KulinerTransactions />} />
      <Route path="admin/settings" element={<KulinerAdminSettings />} />
      <Route path="admin/staff" element={<KulinerStaff />} />
      <Route path="admin/roles" element={<KulinerRoles />} />
      <Route path="admin/profile" element={<KulinerProfile />} />
      <Route path="subscription" element={<KulinerSubscription />} />
      <Route path="admin/support" element={<KulinerSupport />} />

      {/* Phase 1: Menu engineering */}
      <Route path="admin/ingredients" element={<KulinerBahanBaku />} />
      <Route path="admin/recipes" element={<KulinerRecipes />} />
      <Route path="admin/modifiers" element={<KulinerModifiers />} />
      <Route path="admin/addons" element={<KulinerAddons />} />
      <Route path="admin/bundles" element={<KulinerBundles />} />

      {/* Phase 2: Order lifecycle & kitchen operations */}
      <Route path="admin/kitchen-queue" element={<KulinerKitchenQueue />} />
      <Route path="admin/shift" element={<KulinerShift />} />

      {/* Phase 3: Stock operations & loss tracking */}
      <Route path="admin/stock-opname" element={<KulinerStockOpname />} />
      <Route path="admin/waste" element={<KulinerWaste />} />

      {/* Phase 4: Reporting */}
      <Route path="admin/reports-advanced" element={<KulinerAdvancedReports />} />

      {/* Phase 5: Table management */}
      <Route path="admin/tables" element={<KulinerTables />} />
    </Route>
  </Route>
);

export default kulinerRoutes;
