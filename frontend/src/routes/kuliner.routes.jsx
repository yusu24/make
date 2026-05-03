import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './guards';

const KulinerAdminMenu = lazy(() => import('../apps/kuliner/pages/AdminMenu'));
const KulinerAdminSettings = lazy(() => import('../apps/kuliner/pages/AdminSettings'));
const KulinerCategoryStorefront = lazy(() => import('../apps/kuliner/pages/CategoryStorefront'));
const KulinerFullMenu = lazy(() => import('../apps/kuliner/pages/FullMenu'));
const KulinerDashboard = lazy(() => import('../apps/kuliner/pages/KulinerDashboard'));
const KulinerOrders = lazy(() => import('../apps/kuliner/pages/KulinerOrders'));
const KulinerMarketing = lazy(() => import('../apps/kuliner/pages/MarketingDesign'));
const KulinerReports = lazy(() => import('../apps/kuliner/pages/SalesReport'));
const KulinerAnalytics = lazy(() => import('../apps/kuliner/pages/CulinaryAnalytics'));
const KulinerTransactions = lazy(() => import('../apps/kuliner/pages/CulinaryTransactions'));
const KulinerPromos = lazy(() => import('../apps/kuliner/pages/CulinaryPromos'));
const KulinerReviews = lazy(() => import('../apps/kuliner/pages/CulinaryReviews'));
const KulinerStaff = lazy(() => import('../apps/kuliner/pages/CulinaryStaff'));
const KulinerProfile = lazy(() => import('../apps/kuliner/pages/CulinaryProfile'));

const kulinerRoutes = (
  <Route path="/kuliner">
    <Route index element={<KulinerCategoryStorefront />} />
    <Route path="menu" element={<KulinerFullMenu />} />
    <Route path="admin" element={<ProtectedRoute><KulinerDashboard /></ProtectedRoute>} />
    <Route path="admin/orders" element={<ProtectedRoute><KulinerOrders /></ProtectedRoute>} />
    <Route path="admin/categories" element={<ProtectedRoute><KulinerAdminMenu /></ProtectedRoute>} />
    <Route path="admin/marketing" element={<ProtectedRoute><KulinerMarketing /></ProtectedRoute>} />
    <Route path="admin/reports" element={<ProtectedRoute><KulinerReports /></ProtectedRoute>} />
    <Route path="admin/analytics" element={<ProtectedRoute><KulinerAnalytics /></ProtectedRoute>} />
    <Route path="admin/transactions" element={<ProtectedRoute><KulinerTransactions /></ProtectedRoute>} />
    <Route path="admin/promos" element={<ProtectedRoute><KulinerPromos /></ProtectedRoute>} />
    <Route path="admin/reviews" element={<ProtectedRoute><KulinerReviews /></ProtectedRoute>} />
    <Route path="admin/settings" element={<ProtectedRoute><KulinerAdminSettings /></ProtectedRoute>} />
    <Route path="admin/staff" element={<ProtectedRoute><KulinerStaff /></ProtectedRoute>} />
    <Route path="admin/profile" element={<ProtectedRoute><KulinerProfile /></ProtectedRoute>} />
  </Route>
);

export default kulinerRoutes;
