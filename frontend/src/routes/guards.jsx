import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#ffffff'
  }}>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: '64px', height: '64px', background: '#b48c3610', borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#b48c36', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
    `}</style>
  </div>
);

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && (user.role === 'customer' || user.role === 'retail_cashier')) return <Navigate to="/" replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    if (user.role === 'super_admin') return <Navigate to="/dashboard" replace />;
    if (user.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />;
    if (user.business_category === 'Budidaya Ikan') return <Navigate to="/budidaya/dashboard" replace />;
    if (user.business_category === 'Kuliner') return <Navigate to="/kuliner/admin" replace />;
    return <Navigate to="/coming-soon" replace />;
  }
  return children;
};

export const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'super_admin') return <Navigate to="/dashboard" replace />;
  if ((user?.role === 'customer' || user?.role === 'retail_cashier') && user?.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />;
  if ((user?.role === 'customer' || user?.role === 'worker') && user?.business_category === 'Budidaya Ikan') return <Navigate to="/budidaya/dashboard" replace />;
  if (user?.business_category === 'Kuliner') return <Navigate to="/kuliner/admin" replace />;
  return <Navigate to="/coming-soon" replace />;
};
