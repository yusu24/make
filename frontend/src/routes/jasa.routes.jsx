import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { CategoryRoute, ProtectedRoute } from './guards';
const JasaApp = lazy(() => import('../apps/jasa/repo/App'));

// Allow jasa_staff and owner roles to access the jasa module even if their
// business_category is not explicitly set (they inherit it from their tenant).
const jasaRoutes = (
  <Route path="/jasa/*" element={<ProtectedRoute><CategoryRoute allowedCategory="Jasa" allowedRoles={['jasa_staff', 'jasa_owner', 'owner']}><JasaApp /></CategoryRoute></ProtectedRoute>} />
);

export default jasaRoutes;
