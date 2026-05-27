import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../apps/admin/pages/Dashboard';
import Users from '../apps/admin/pages/Users';
import Categories from '../apps/admin/pages/Categories';
import AdminRetailView from '../apps/admin/pages/AdminRetailView';
import Tenants from '../apps/admin/pages/Tenants';
import Subscriptions from '../apps/admin/pages/Subscriptions';
import PackagesFeatures from '../apps/admin/pages/PackagesFeatures';
import Finance from '../apps/admin/pages/Finance';
import SupportCenter from '../apps/admin/pages/SupportCenter';
import SystemMonitoring from '../apps/admin/pages/SystemMonitoring';
import ContentAnnouncement from '../apps/admin/pages/ContentAnnouncement';
import ReportsAnalytics from '../apps/admin/pages/ReportsAnalytics';
import DeveloperIntegrations from '../apps/admin/pages/DeveloperIntegrations';
import Admins from '../apps/admin/pages/Admins';
import SaasRoles from '../apps/admin/pages/SaasRoles';
import ActivityLogs from '../apps/admin/pages/ActivityLogs';
import Profile from '../apps/admin/pages/Profile';
import LandingSettings from '../apps/admin/pages/LandingSettings';
import { ProtectedRoute } from './guards';

const adminRoutes = (
  <>
    <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
    <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
    <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
    <Route path="categories/:categoryName" element={<ProtectedRoute adminOnly><AdminRetailView /></ProtectedRoute>} />
    <Route path="tenants" element={<ProtectedRoute adminOnly><Tenants /></ProtectedRoute>} />
    <Route path="subscriptions" element={<ProtectedRoute adminOnly><Subscriptions /></ProtectedRoute>} />
    <Route path="packages-features" element={<ProtectedRoute adminOnly><PackagesFeatures /></ProtectedRoute>} />
    <Route path="finance" element={<ProtectedRoute adminOnly><Finance /></ProtectedRoute>} />
    <Route path="support-center" element={<ProtectedRoute adminOnly><SupportCenter /></ProtectedRoute>} />
    <Route path="system-monitoring" element={<ProtectedRoute adminOnly><SystemMonitoring /></ProtectedRoute>} />
    <Route path="content-announcement" element={<ProtectedRoute adminOnly><ContentAnnouncement /></ProtectedRoute>} />
    <Route path="reports-analytics" element={<ProtectedRoute adminOnly><ReportsAnalytics /></ProtectedRoute>} />
    <Route path="admins" element={<ProtectedRoute adminOnly><Admins /></ProtectedRoute>} />
    <Route path="saas-roles" element={<ProtectedRoute adminOnly><SaasRoles /></ProtectedRoute>} />
    <Route path="logs" element={<ProtectedRoute adminOnly><ActivityLogs /></ProtectedRoute>} />
    <Route path="settings" element={<ProtectedRoute adminOnly><LandingSettings /></ProtectedRoute>} />
    <Route path="landing-settings" element={<ProtectedRoute adminOnly><LandingSettings /></ProtectedRoute>} />
    <Route path="developer-integrations" element={<ProtectedRoute adminOnly><DeveloperIntegrations /></ProtectedRoute>} />
    <Route path="profile" element={<Profile />} />
  </>
);

export default adminRoutes;
