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

export function getCategoryDashboardPath(category) {
  if (!category) return '/coming-soon';
  const cat = String(category).toLowerCase();
  
  if (cat.includes('retail') || cat.includes('toko')) return '/retail/dashboard';
  if (cat.includes('budi') || cat.includes('ternak') || cat.includes('tani') || cat.includes('ikan') || cat.includes('agri')) return '/budidaya/dashboard';
  if (cat.includes('kuliner') || cat.includes('resto') || cat.includes('cafe') || cat.includes('kafe') || cat.includes('f&b')) return '/kuliner/admin';
  if (cat.includes('seller') || cat.includes('online') || cat.includes('commerce') || cat.includes('omnichannel')) return '/seller/dashboard';
  if (cat.includes('jasa') || cat.includes('repair') || cat.includes('servis') || cat.includes('bengkel')) return '/jasa/dashboard';
  
  return '/coming-soon';
}

export function isCategoryAllowed(userCategory, allowedCategories) {
  if (!userCategory) return false;
  const userCat = String(userCategory).toLowerCase();
  const list = Array.isArray(allowedCategories) ? allowedCategories : [allowedCategories];
  
  return list.some(item => {
    const target = String(item).toLowerCase();
    if ((target === 'retail' || target === 'toko retail') && (userCat.includes('retail') || userCat.includes('toko'))) return true;
    if ((target === 'budidaya' || target.includes('budidaya')) && (userCat.includes('budi') || userCat.includes('ternak') || userCat.includes('tani') || userCat.includes('ikan') || userCat.includes('agri'))) return true;
    if ((target === 'kuliner' || target.includes('kuliner')) && (userCat.includes('kuliner') || userCat.includes('resto') || userCat.includes('cafe') || userCat.includes('kafe') || userCat.includes('f&b'))) return true;
    if ((target === 'seller' || target.includes('seller')) && (userCat.includes('seller') || userCat.includes('online') || userCat.includes('commerce') || userCat.includes('omnichannel'))) return true;
    if ((target === 'jasa' || target.includes('jasa')) && (userCat.includes('jasa') || userCat.includes('repair') || userCat.includes('servis') || userCat.includes('bengkel'))) return true;
    return userCat === target;
  });
}

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) {
    const wasDemo = sessionStorage.getItem('is_demo_sandbox') === 'true';
    return <Navigate to={wasDemo ? "/" : "/login"} replace />;
  }
  if (adminOnly && (user.role === 'customer' || user.role === 'retail_cashier')) return <Navigate to="/" replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    if (user.role === 'super_admin' || user.role === 'admin') return <Navigate to="/dashboard" replace />;
    const targetPath = getCategoryDashboardPath(user.business_category);
    return <Navigate to={targetPath} replace />;
  }
  return children;
};

export const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'super_admin' || user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  const targetPath = getCategoryDashboardPath(user?.business_category);
  return <Navigate to={targetPath} replace />;
};

export const CategoryRoute = ({ children, allowedCategory }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return children;
  
  if (!isCategoryAllowed(user.business_category, allowedCategory)) {
    return <Navigate to="/dashboard-redirect" replace />;
  }
  return children;
};
