import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards';

const BudidayaLayout = lazy(() => import('../apps/budidaya/BudidayaLayout'));
const BudidayaDashboard = lazy(() => import('../apps/budidaya/pages/Dashboard'));
const BudidayaPonds = lazy(() => import('../apps/budidaya/pages/Ponds'));
const BudidayaPondDetail = lazy(() => import('../apps/budidaya/pages/PondDetail'));
const BudidayaCycles = lazy(() => import('../apps/budidaya/pages/Cycles'));
const BudidayaCycleDetail = lazy(() => import('../apps/budidaya/pages/CycleDetail'));
const BudidayaFeeds = lazy(() => import('../apps/budidaya/pages/Feeds'));
const BudidayaFeedCategories = lazy(() => import('../apps/budidaya/pages/FeedCategories'));
const BudidayaFeedUnits = lazy(() => import('../apps/budidaya/pages/FeedUnits'));
const BudidayaReports = lazy(() => import('../apps/budidaya/pages/Reports'));
const BudidayaSettings = lazy(() => import('../apps/budidaya/pages/Settings'));
const BudidayaUsers = lazy(() => import('../apps/budidaya/pages/UserManagement'));
const BudidayaRoles = lazy(() => import('../apps/budidaya/pages/RolesPermissions'));
const BudidayaInventory = lazy(() => import('../apps/budidaya/pages/Inventory'));

// Note: We'll wrap this in ProtectedRoute in App.jsx or here
const budidayaRoutes = (
  <Route path="/budidaya" element={<ProtectedRoute><BudidayaLayout /></ProtectedRoute>}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<BudidayaDashboard />} />
    <Route path="ponds" element={<BudidayaPonds />} />
    <Route path="ponds/:id" element={<BudidayaPondDetail />} />
    <Route path="inventory" element={<BudidayaInventory />} />
    <Route path="users" element={<BudidayaUsers />} />
    <Route path="roles" element={<BudidayaRoles />} />
    <Route path="cycles" element={<BudidayaCycles />} />
    <Route path="cycles/:id" element={<BudidayaCycleDetail />} />
    <Route path="feeds" element={<BudidayaFeeds />} />
    <Route path="feed-categories" element={<BudidayaFeedCategories />} />
    <Route path="feed-units" element={<BudidayaFeedUnits />} />
    <Route path="reports" element={<BudidayaReports />} />
    <Route path="settings" element={<BudidayaSettings />} />
  </Route>
);

export default budidayaRoutes;
