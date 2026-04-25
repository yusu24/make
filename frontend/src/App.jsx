import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { lazy, Suspense } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ComingSoon from './pages/ComingSoon'

// Admin pages - eager load (small)
import Dashboard from './apps/admin/pages/Dashboard'
import Users from './apps/admin/pages/Users'
import Categories from './apps/admin/pages/Categories'
import AdminRetailView from './apps/admin/pages/AdminRetailView'
import Tenants from './apps/admin/pages/Tenants'
import Admins from './apps/admin/pages/Admins'
import ActivityLogs from './apps/admin/pages/ActivityLogs'
import Profile from './apps/admin/pages/Profile'

// Retail pages - lazy load for faster initial navigation
const RetailDashboard = lazy(() => import('./apps/retail/pages/Dashboard'))
const RetailProducts = lazy(() => import('./apps/retail/pages/Products'))
const RetailPos = lazy(() => import('./apps/retail/pages/Pos'))
const RetailCategories = lazy(() => import('./apps/retail/pages/Categories'))
const RetailExpenseCategories = lazy(() => import('./apps/retail/pages/ExpenseCategories'))
const RetailSuppliers = lazy(() => import('./apps/retail/pages/Suppliers'))
const RetailCustomers = lazy(() => import('./apps/retail/pages/Customers'))
const RetailStaff = lazy(() => import('./apps/retail/pages/Staff'))
const RetailRoles = lazy(() => import('./apps/retail/pages/Roles'))
const RetailSubscription = lazy(() => import('./apps/retail/pages/Subscription'))
const RetailSalesReport = lazy(() => import('./apps/retail/pages/SalesReport'))
const RetailProductReport = lazy(() => import('./apps/retail/pages/ProductReport'))
const RetailCustomerReport = lazy(() => import('./apps/retail/pages/CustomerReport'))
const RetailStockEntry = lazy(() => import('./apps/retail/pages/StockEntry'))
const RetailUnits = lazy(() => import('./apps/retail/pages/Units'))
const RetailInventory = lazy(() => import('./apps/retail/pages/Inventory'))
const RetailFinanceSummary = lazy(() => import('./apps/retail/pages/FinanceSummary'))
const RetailExpenses = lazy(() => import('./apps/retail/pages/Expenses'))

// Budidaya pages - lazy load
const BudidayaLayout = lazy(() => import('./apps/budidaya/BudidayaLayout'))
const BudidayaDashboard = lazy(() => import('./apps/budidaya/pages/Dashboard'))
const BudidayaPonds = lazy(() => import('./apps/budidaya/pages/Ponds'))
const BudidayaCycles = lazy(() => import('./apps/budidaya/pages/Cycles'))
const BudidayaCycleDetail = lazy(() => import('./apps/budidaya/pages/CycleDetail'))
const BudidayaFeeds = lazy(() => import('./apps/budidaya/pages/Feeds'))
const BudidayaFeedCategories = lazy(() => import('./apps/budidaya/pages/FeedCategories'))
const BudidayaFeedUnits = lazy(() => import('./apps/budidaya/pages/FeedUnits'))
const BudidayaReports = lazy(() => import('./apps/budidaya/pages/Reports'))
const BudidayaSettings = lazy(() => import('./apps/budidaya/pages/Settings'))
const BudidayaUsers = lazy(() => import('./apps/budidaya/pages/UserManagement'))
const BudidayaRoles = lazy(() => import('./apps/budidaya/pages/RolesPermissions'))

const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', background: 'var(--bg-base)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 12px', borderWidth: 3 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Memuat halaman...</p>
    </div>
  </div>
)

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && (user.role === 'customer' || user.role === 'retail_cashier')) return <Navigate to="/" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) {
    if (user.role === 'super_admin') return <Navigate to="/dashboard" replace />
    if (user.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />
    if (user.business_category === 'Budidaya Ikan') return <Navigate to="/budidaya/dashboard" replace />
    return <Navigate to="/coming-soon" replace />
  }
  return children
}

const RootRedirect = () => {
  const { user } = useAuth()
  if (user?.role === 'super_admin') return <Navigate to="/dashboard" replace />
  if ((user?.role === 'customer' || user?.role === 'retail_cashier') && user?.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />
  if ((user?.role === 'customer' || user?.role === 'worker') && user?.business_category === 'Budidaya Ikan') return <Navigate to="/budidaya/dashboard" replace />
  return <Navigate to="/coming-soon" replace />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<RootRedirect />} />
                <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
                <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
                <Route path="categories/:categoryName" element={<ProtectedRoute adminOnly><AdminRetailView /></ProtectedRoute>} />
                <Route path="tenants" element={<ProtectedRoute adminOnly><Tenants /></ProtectedRoute>} />
                <Route path="admins" element={<ProtectedRoute adminOnly><Admins /></ProtectedRoute>} />
                <Route path="logs" element={<ProtectedRoute adminOnly><ActivityLogs /></ProtectedRoute>} />
                <Route path="profile" element={<Profile />} />

                <Route path="retail">
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<RetailDashboard />} />
                  <Route path="pos" element={<RetailPos />} />

                  {/* DATA MASTER */}
                  <Route path="products" element={<RetailProducts />} />
                  <Route path="inventory" element={<RetailInventory />} />
                  <Route path="stock" element={<RetailStockEntry />} />
                  <Route path="categories" element={<RetailCategories />} />
                  <Route path="units" element={<RetailUnits />} />
                  <Route path="suppliers" element={<RetailSuppliers />} />
                  <Route path="customers" element={<RetailCustomers />} />
                  <Route path="expense-categories" element={<RetailExpenseCategories />} />
                  <Route path="staff" element={<RetailStaff />} />
                  <Route path="roles" element={<RetailRoles />} />
                  <Route path="subscription" element={<RetailSubscription />} />

                  {/* LAPORAN */}
                  <Route path="reports">
                    <Route index element={<Navigate to="sales" replace />} />
                    <Route path="sales" element={<RetailSalesReport />} />
                    <Route path="products" element={<RetailProductReport />} />
                    <Route path="customers" element={<RetailCustomerReport />} />
                  </Route>

                  {/* KEUANGAN */}
                  <Route path="finance">
                    <Route index element={<Navigate to="summary" replace />} />
                    <Route path="summary" element={<RetailFinanceSummary />} />
                    <Route path="expenses" element={<RetailExpenses />} />
                  </Route>
                </Route>
              </Route>

              {/* Budidaya App */}
                <Route path="/budidaya" element={<ProtectedRoute><BudidayaLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<BudidayaDashboard />} />
                  <Route path="ponds" element={<BudidayaPonds />} />
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

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
