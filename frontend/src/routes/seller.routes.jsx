/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { CategoryRoute } from './guards';

const SellerApp = lazy(() => import('../apps/seller/repo/SellerApp'));
import { ProtectedRoute } from './guards';

const sellerRoutes = (
  <Route path="/seller/*" element={<ProtectedRoute><CategoryRoute allowedCategory="Seller"><SellerApp /></CategoryRoute></ProtectedRoute>} />
);

export default sellerRoutes;
