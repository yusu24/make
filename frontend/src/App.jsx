import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Suspense } from 'react'

import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ComingSoon from './pages/ComingSoon'
import ErrorBoundary from './components/ErrorBoundary'

// Route Guards
import { ProtectedRoute, GuestRoute, RootRedirect, PageLoader } from './routes/guards'

// Route Modules
import adminRoutes from './routes/admin.routes'
import retailRoutes from './routes/retail.routes'
import budidayaRoutes from './routes/budidaya.routes'
import kulinerRoutes from './routes/kuliner.routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public / Guest Routes */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                
                {/* Shared Protected Routes */}
                <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
                
                {/* Main Application Layout (SaaS Admin & Retail) */}
                <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<RootRedirect />} />
                  
                  {/* SaaS Admin Module */}
                  {adminRoutes}

                  {/* Retail Module */}
                  {retailRoutes}
                </Route>

                {/* Budidaya Module */}
                {budidayaRoutes}

                {/* Kuliner Module */}
                {kulinerRoutes}

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
