import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css'; // Reusing some background classes

export default function ComingSoon() {
  const navigate = useNavigate();
  const { logout, user, isImpersonating, exitImpersonate } = useAuth();

  const DEMO_EMAILS = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','manufaktur@demo.com']

  const impersonating = isImpersonating && isImpersonating();

  const isDemoSandbox = !impersonating && (
    user?.email?.includes('demo-sandbox-') ||
    DEMO_EMAILS.includes(user?.email)
  );

  const handleLogout = () => {
    if (impersonating) {
      const redirectPath = exitImpersonate();
      navigate(redirectPath || '/tenants');
    } else {
      logout();
      navigate(isDemoSandbox ? '/' : '/login');
    }
  };

  const exitBtnLabel = impersonating
    ? 'Keluar dari Impersonate'
    : isDemoSandbox
      ? 'Keluar dari Akun Demo'
      : 'Keluar (Logout)';

  return (
    <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__grid" />
      </div>

      <div className="card card-pad animate-fade-in" style={{ maxWidth: 500, width: '100%', textAlign: 'center', zIndex: 1, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Segera Hadir!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
          Halo <strong>{user?.name || 'Pemilik Bisnis'}</strong>! 
          <br/>
          Terima kasih telah bergabung di BIZORA SaaS. Mohon maaf, modul <strong style={{color: 'var(--primary-600)'}}>{user?.business_category || 'untuk kategori Anda'}</strong> saat ini masih dalam tahap pengerjaan (Under Construction) oleh tim developer kami untuk memberikan fitur terbaik untuk bisnis Anda.
        </p>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Silakan coba modul <strong>Toko Retail</strong> untuk demo, atau kembali lagi nanti. Kami akan segera memberi tahu Anda setelah modul ini diluncurkan secara resmi!</p>
        </div>

        <button className="btn btn-secondary btn-lg btn-full" onClick={handleLogout}>
          {exitBtnLabel}
        </button>
      </div>
    </div>
  );
}
