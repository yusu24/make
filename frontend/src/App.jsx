import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/Toast'
import { ConfirmDialogProvider } from './components/ConfirmDialog'
import { Suspense, useEffect } from 'react'

import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import ComingSoon from './pages/ComingSoon'
import ErrorPage from './pages/ErrorPage'
import TenantSupportCenter from './pages/TenantSupportCenter'
import ErrorBoundary from './components/ErrorBoundary'
import { reportError } from './lib/errorReporting'

// Benign browser noise that isn't an actual app crash — never worth
// yanking the user to the error page for these.
const IGNORED_ERROR_PATTERNS = [/ResizeObserver loop/i]

function isIgnorable(message) {
  return IGNORED_ERROR_PATTERNS.some(re => re.test(message || ''))
}

// Route Guards
import { ProtectedRoute, GuestRoute, RootRedirect, PageLoader } from './routes/guards'

// Route Modules
import adminRoutes from './routes/admin.routes'
import retailRoutes from './routes/retail.routes'
import budidayaRoutes from './routes/budidaya.routes'
import kulinerRoutes from './routes/kuliner.routes'

function App() {
  // Catches errors React's own ErrorBoundary can't: thrown inside event
  // handlers, setTimeout/async callbacks, and unhandled promise rejections.
  useEffect(() => {
    const onError = (event) => {
      if (isIgnorable(event?.message)) return
      reportError(event?.error || event?.message || 'Unknown error')
    }
    const onRejection = (event) => {
      const reason = event?.reason
      if (isIgnorable(reason?.message || reason)) return
      reportError(reason instanceof Error ? reason : new Error(String(reason)))
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <ConfirmDialogProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing page for guests & sandbox testing */}
                <Route path="/" element={<Landing />} />

                {/* Error page — reached via reportError() from ErrorBoundary
                    or the global window error/unhandledrejection listeners */}
                <Route path="/error" element={<ErrorPage />} />

                {/* Public / Guest Routes */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                
                {/* Shared Protected Routes */}
                <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
                
                {/* Main Application Layout (SaaS Admin & Retail under pathless Protected wrapper) */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard-redirect" element={<RootRedirect />} />
                  
                  {/* SaaS Admin Module */}
                  {adminRoutes}

                  {/* Retail Module */}
                  {retailRoutes}

                  {/* Generic Tenant Modules */}
                  <Route path="/support" element={<TenantSupportCenter />} />
                </Route>

                {/* Budidaya Module */}
                {budidayaRoutes}

                {/* Kuliner Module */}
                {kulinerRoutes}

                {/* Fallback to root (which redirects to dashboard if logged in) */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
        </ConfirmDialogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
