import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../apps/admin/pages/Dashboard';
import Users from '../apps/admin/pages/Users';
import Categories from '../apps/admin/pages/Categories';
import AdminRetailView from '../apps/admin/pages/AdminRetailView';
import Tenants from '../apps/admin/pages/Tenants';
import Admins from '../apps/admin/pages/Admins';
import ActivityLogs from '../apps/admin/pages/ActivityLogs';
import Profile from '../apps/admin/pages/Profile';
import { ProtectedRoute } from './guards';

const adminRoutes = (
  <>
    <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
    <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
    <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
    <Route path="categories/:categoryName" element={<ProtectedRoute adminOnly><AdminRetailView /></ProtectedRoute>} />
    <Route path="tenants" element={<ProtectedRoute adminOnly><Tenants /></ProtectedRoute>} />
    <Route path="admins" element={<ProtectedRoute adminOnly><Admins /></ProtectedRoute>} />
    <Route path="logs" element={<ProtectedRoute adminOnly><ActivityLogs /></ProtectedRoute>} />
    <Route path="profile" element={<Profile />} />
  </>
);

export default adminRoutes;
