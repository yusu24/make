import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../apps/admin/pages/Dashboard';
import Users from '../apps/admin/pages/Users';
import Categories from '../apps/admin/pages/Categories';
import AdminRetailView from '../apps/admin/pages/AdminRetailView';
import Tenants from '../apps/admin/pages/Tenants';
import Subscriptions from '../apps/admin/pages/Subscriptions';
import TenantVerifications from '../apps/admin/pages/TenantVerifications';
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
import Backups from '../apps/admin/pages/Backups';
import ModuleDocumentation from '../apps/admin/pages/ModuleDocumentation';
import CustomerOnboardingGuide from '../apps/admin/pages/CustomerOnboardingGuide';
import AdminDocumentationDashboard from '../apps/admin/pages/AdminDocumentationDashboard';
import DocumentationCenter from '../apps/admin/pages/DocumentationCenter';
import InvoiceSettings from '../apps/admin/pages/InvoiceSettings';
import SubscriptionReminders from '../apps/admin/pages/SubscriptionReminders';
import { ProtectedRoute } from './guards';

const adminRoutes = (
  <>
    <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
    <Route path="admin/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
    <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
    <Route path="admin/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
    <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
    <Route path="admin/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
    <Route path="categories/:categoryName" element={<ProtectedRoute adminOnly><AdminRetailView /></ProtectedRoute>} />
    <Route path="tenants" element={<ProtectedRoute adminOnly><Tenants /></ProtectedRoute>} />
    <Route path="admin/tenants" element={<ProtectedRoute adminOnly><Tenants /></ProtectedRoute>} />
    <Route path="kyc" element={<ProtectedRoute adminOnly><TenantVerifications /></ProtectedRoute>} />
    <Route path="subscriptions" element={<ProtectedRoute adminOnly><Subscriptions defaultTab="list" /></ProtectedRoute>} />
    <Route path="admin/subscriptions" element={<ProtectedRoute adminOnly><Subscriptions defaultTab="list" /></ProtectedRoute>} />
    <Route path="subscription-requests" element={<ProtectedRoute adminOnly><Subscriptions defaultTab="requests" /></ProtectedRoute>} />
    <Route path="admin/subscription-requests" element={<ProtectedRoute adminOnly><Subscriptions defaultTab="requests" /></ProtectedRoute>} />
    <Route path="packages-features" element={<ProtectedRoute adminOnly><PackagesFeatures /></ProtectedRoute>} />
    <Route path="admin/packages-features" element={<ProtectedRoute adminOnly><PackagesFeatures /></ProtectedRoute>} />
    <Route path="finance" element={<ProtectedRoute adminOnly><Finance /></ProtectedRoute>} />
    <Route path="admin/finance" element={<ProtectedRoute adminOnly><Finance /></ProtectedRoute>} />
    <Route path="invoice-settings" element={<ProtectedRoute adminOnly><InvoiceSettings /></ProtectedRoute>} />
    <Route path="admin/invoice-settings" element={<ProtectedRoute adminOnly><InvoiceSettings /></ProtectedRoute>} />
    <Route path="subscription-reminders" element={<ProtectedRoute adminOnly><SubscriptionReminders /></ProtectedRoute>} />
    <Route path="admin/subscription-reminders" element={<ProtectedRoute adminOnly><SubscriptionReminders /></ProtectedRoute>} />
    <Route path="support-center" element={<ProtectedRoute adminOnly><SupportCenter /></ProtectedRoute>} />
    <Route path="admin/support-center" element={<ProtectedRoute adminOnly><SupportCenter /></ProtectedRoute>} />
    <Route path="system-monitoring" element={<ProtectedRoute adminOnly><SystemMonitoring /></ProtectedRoute>} />
    <Route path="admin/system-monitoring" element={<ProtectedRoute adminOnly><SystemMonitoring /></ProtectedRoute>} />
    <Route path="content-announcement" element={<ProtectedRoute adminOnly><ContentAnnouncement /></ProtectedRoute>} />
    <Route path="admin/content-announcement" element={<ProtectedRoute adminOnly><ContentAnnouncement /></ProtectedRoute>} />
    <Route path="reports-analytics" element={<ProtectedRoute adminOnly><ReportsAnalytics defaultTab="overview" /></ProtectedRoute>} />
    <Route path="admin/reports-analytics" element={<ProtectedRoute adminOnly><ReportsAnalytics defaultTab="overview" /></ProtectedRoute>} />
    <Route path="reports-revenue" element={<ProtectedRoute adminOnly><ReportsAnalytics defaultTab="revenue" /></ProtectedRoute>} />
    <Route path="admin/reports-revenue" element={<ProtectedRoute adminOnly><ReportsAnalytics defaultTab="revenue" /></ProtectedRoute>} />
    <Route path="reports-tenants" element={<ProtectedRoute adminOnly><ReportsAnalytics defaultTab="tenants" /></ProtectedRoute>} />
    <Route path="admin/reports-tenants" element={<ProtectedRoute adminOnly><ReportsAnalytics defaultTab="tenants" /></ProtectedRoute>} />
    <Route path="admins" element={<ProtectedRoute adminOnly><Admins /></ProtectedRoute>} />
    <Route path="admin/admins" element={<ProtectedRoute adminOnly><Admins /></ProtectedRoute>} />
    <Route path="saas-roles" element={<ProtectedRoute adminOnly><SaasRoles /></ProtectedRoute>} />
    <Route path="admin/saas-roles" element={<ProtectedRoute adminOnly><SaasRoles /></ProtectedRoute>} />
    <Route path="logs" element={<ProtectedRoute adminOnly><ActivityLogs /></ProtectedRoute>} />
    <Route path="admin/logs" element={<ProtectedRoute adminOnly><ActivityLogs /></ProtectedRoute>} />
    <Route path="settings" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="general" /></ProtectedRoute>} />
    <Route path="admin/settings" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="general" /></ProtectedRoute>} />
    <Route path="landing-settings" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="general" /></ProtectedRoute>} />
    <Route path="admin/landing-settings" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="general" /></ProtectedRoute>} />
    <Route path="landing-sectors" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="sectors" /></ProtectedRoute>} />
    <Route path="admin/landing-sectors" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="sectors" /></ProtectedRoute>} />
    <Route path="landing-features" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="features" /></ProtectedRoute>} />
    <Route path="admin/landing-features" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="features" /></ProtectedRoute>} />
    <Route path="landing-howitworks" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="howitworks" /></ProtectedRoute>} />
    <Route path="admin/landing-howitworks" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="howitworks" /></ProtectedRoute>} />
    <Route path="landing-faq" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="faq" /></ProtectedRoute>} />
    <Route path="admin/landing-faq" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="faq" /></ProtectedRoute>} />
    <Route path="landing-testimonials" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="testimonials" /></ProtectedRoute>} />
    <Route path="admin/landing-testimonials" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="testimonials" /></ProtectedRoute>} />
    <Route path="landing-billing" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="billing" /></ProtectedRoute>} />
    <Route path="admin/landing-billing" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="billing" /></ProtectedRoute>} />
    <Route path="landing-logo" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="logo" /></ProtectedRoute>} />
    <Route path="admin/landing-logo" element={<ProtectedRoute adminOnly><LandingSettings defaultTab="logo" /></ProtectedRoute>} />
    <Route path="developer-integrations" element={<ProtectedRoute adminOnly><DeveloperIntegrations /></ProtectedRoute>} />
    <Route path="admin/developer-integrations" element={<ProtectedRoute adminOnly><DeveloperIntegrations /></ProtectedRoute>} />
    <Route path="module-docs" element={<ProtectedRoute adminOnly><ModuleDocumentation /></ProtectedRoute>} />
    <Route path="admin/module-docs" element={<ProtectedRoute adminOnly><ModuleDocumentation /></ProtectedRoute>} />
    <Route path="backups" element={<ProtectedRoute adminOnly><Backups /></ProtectedRoute>} />
    <Route path="admin/backups" element={<ProtectedRoute adminOnly><Backups /></ProtectedRoute>} />
    <Route path="doc-dashboard" element={<ProtectedRoute adminOnly><AdminDocumentationDashboard /></ProtectedRoute>} />
    <Route path="admin/doc-dashboard" element={<ProtectedRoute adminOnly><AdminDocumentationDashboard /></ProtectedRoute>} />
    <Route path="doc-center" element={<ProtectedRoute adminOnly><DocumentationCenter /></ProtectedRoute>} />
    <Route path="admin/doc-center" element={<ProtectedRoute adminOnly><DocumentationCenter /></ProtectedRoute>} />
    <Route path="profile" element={<Profile />} />
    <Route path="admin/profile" element={<Profile />} />
  </>
);

export default adminRoutes;
