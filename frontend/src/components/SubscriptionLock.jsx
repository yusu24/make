import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Rocket, ArrowRight } from 'lucide-react';

const SubscriptionLock = ({ status, daysLeft }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [forceLock, setForceLock] = useState(false);

  useEffect(() => {
    const handleExpired = () => setForceLock(true);
    window.addEventListener('subscription_expired', handleExpired);
    return () => window.removeEventListener('subscription_expired', handleExpired);
  }, []);

  // Admin & super_admin are never locked — they are impersonating for dev/maintenance
  if (user?.role === 'super_admin' || user?.role === 'admin') return null;

  const effectiveStatus = forceLock ? 'locked' : status;

  if (!effectiveStatus || effectiveStatus === 'active') return null;
  if (user?.role === 'super_admin' || user?.role === 'admin') return null;

  const getSubscriptionPath = () => {
    if (user?.business_category === 'Budidaya Hewan' || user?.business_category === 'Budidaya Tanaman' || location.pathname.startsWith('/budidaya')) {
      return '/budidaya/subscription';
    }
    if (user?.business_category === 'Kuliner' || location.pathname.startsWith('/kuliner')) {
      return '/kuliner/subscription';
    }
    if (user?.business_category === 'Seller' || location.pathname.startsWith('/seller')) {
      return '/seller/subscription';
    }
    if (user?.business_category === 'Jasa' || location.pathname.startsWith('/jasa')) {
      return '/jasa/subscription';
    }
    return '/retail/subscription';
  };

  const subPath = getSubscriptionPath();

  if (status === 'warning') {
    return (
      <div className="subscription-warning">
        <div className="subscription-warning__content">
          <span className="subscription-warning__icon">⚠️</span>
          <p>
            Masa percobaan tester Anda akan habis dalam <strong>{daysLeft} hari</strong>. 
            Segera upgrade paket untuk tetap bisa menggunakan layanan.
          </p>
          <button onClick={() => navigate(subPath)} className="btn btn-sm btn-primary">
            Upgrade Sekarang
          </button>
        </div>
      </div>
    );
  }

  // If locked, we MUST hide the overlay IF the user is currently looking at the subscription page, 
  // otherwise they can never actually upgrade.
  if (effectiveStatus === 'locked' && location.pathname !== subPath) {
    return (
      <div className="subscription-lock-overlay">
        <div className="subscription-lock-card animate-fade-in">
          <div className="subscription-lock-card__icon">
            <Lock size={48} />
          </div>
          <h2>Akses Terkunci 🔒</h2>
          <p>
            Masa percobaan 5 hari Anda telah habis. Seluruh fitur telah dinonaktifkan sementara. 
            Silakan pilih paket langganan di bawah ini untuk mengaktifkan kembali akun Anda.
          </p>
          <div className="subscription-lock-card__options">
            <div className="lock-option" onClick={() => navigate(subPath)}>
              <div className="lock-option__main">
                <Rocket size={24} />
                <div>
                  <div className="lock-option__title">Pilih Paket Langganan</div>
                  <div className="lock-option__desc">Basic atau Pro mulai dari Rp 100rb-an</div>
                </div>
              </div>
              <ArrowRight size={20} />
            </div>
          </div>
          <button onClick={() => {
            const demoEmails = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','seller@demo.com'];
            const isDemo = user?.email?.startsWith('demo-sandbox-') || user?.email?.startsWith('demo-kuliner-') || demoEmails.includes(user?.email);
            logout();
            navigate(isDemo ? '/' : '/login');
          }} className="btn btn-ghost btn-full mt-4">
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionLock;
