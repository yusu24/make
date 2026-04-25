import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css'; // Reusing some background classes

export default function ComingSoon() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          Halo <strong>{user?.name || 'UMKM Owner'}</strong>! 
          <br/>
          Terima kasih telah bergabung di UMKM SaaS. Mohon maaf, modul <strong style={{color: 'var(--primary-600)'}}>{user?.business_category || 'untuk kategori Anda'}</strong> saat ini masih dalam tahap pengerjaan (Under Construction) oleh tim developer kami untuk memberikan fitur terbaik untuk bisnis Anda.
        </p>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Silakan coba modul <strong>Toko Retail</strong> untuk demo, atau kembali lagi nanti. Kami akan segera memberi tahu Anda setelah modul ini diluncurkan secara resmi!</p>
        </div>

        <button className="btn btn-secondary btn-lg btn-full" onClick={handleLogout}>
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
}
