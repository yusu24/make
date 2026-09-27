/* eslint-disable react-refresh/only-export-components */
import { Route, Navigate, useLocation } from 'react-router-dom';

/**
 * RetailRedirect automatically forwards legacy /retail URLs to the unified
 * /seller module (Ritel & Omnichannel) while preserving subpaths and query strings.
 */
const RetailRedirect = () => {
  const location = useLocation();
  const path = location.pathname.replace(/^\/retail/, '/seller');
  const target = path === '/seller' || path === '/seller/' ? '/seller/dashboard' : path;
  return <Navigate to={target + location.search} replace />;
};

const retailRoutes = (
  <>
    <Route path="retail" element={<Navigate to="/seller/dashboard" replace />} />
    <Route path="retail/*" element={<RetailRedirect />} />
  </>
);

export default retailRoutes;
