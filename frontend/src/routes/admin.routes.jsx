import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './guards';

const Dashboard = lazy(() => import('../apps/admin/pages/Dashboard'));
const Users = lazy(() => import('../apps/admin/pages/Users'));
const Categories = lazy(() => import('../apps/admin/pages/Categories'));
const AdminRetailView = lazy(() => import('../apps/admin/pages/AdminRetailView'));
const Tenants = lazy(() => import('../apps/admin/pages/Tenants'));
const Subscriptions = lazy(() => import('../apps/admin/pages/Subscriptions'));
const TenantVerifications = lazy(() => import('../apps/admin/pages/TenantVerifications'));
const PackagesFeatures = lazy(() => import('../apps/admin/pages/PackagesFeatures'));
const Finance = lazy(() => import('../apps/admin/pages/Finance'));
const SupportCenter = lazy(() => import('../apps/admin/pages/SupportCenter'));
const SystemMonitoring = lazy(() => import('../apps/admin/pages/SystemMonitoring'));
const ContentAnnouncement = lazy(() => import('../apps/admin/pages/ContentAnnouncement'));
const ReportsAnalytics = lazy(() => import('../apps/admin/pages/ReportsAnalytics'));
const DeveloperIntegrations = lazy(() => import('../apps/admin/pages/DeveloperIntegrations'));
const Admins = lazy(() => import('../apps/admin/pages/Admins'));
const SaasRoles = lazy(() => import('../apps/admin/pages/SaasRoles'));
const ActivityLogs = lazy(() => import('../apps/admin/pages/ActivityLogs'));
const Profile = lazy(() => import('../apps/admin/pages/Profile'));
const LandingSettings = lazy(() => import('../apps/admin/pages/LandingSettings'));
const Backups = lazy(() => import('../apps/admin/pages/Backups'));
const ModuleDocumentation = lazy(() => import('../apps/admin/pages/ModuleDocumentation'));
const CustomerOnboardingGuide = lazy(() => import('../apps/admin/pages/CustomerOnboardingGuide'));
const AdminDocumentationDashboard = lazy(() => import('../apps/admin/pages/AdminDocumentationDashboard'));
const DocumentationCenter = lazy(() => import('../apps/admin/pages/DocumentationCenter'));
const InvoiceSettings = lazy(() => import('../apps/admin/pages/InvoiceSettings'));
const SubscriptionReminders = lazy(() => import('../apps/admin/pages/SubscriptionReminders'));

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
