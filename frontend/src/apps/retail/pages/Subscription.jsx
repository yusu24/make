import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';

export default function Subscription() {
  const { user } = useAuth();
  const [tenantInfo, setTenantInfo] = useState(null);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [staffRes, subRes] = await Promise.all([
        api.get('/retail/staff'),
        api.get('/subscription/current')
      ]);
      setStaffCount(staffRes.data.length || 0);
      setPendingReq(subRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await api.post('/subscription/request', { plan: selectedPlan.id });
      fetchData();
      setShowOrderModal(false);
      alert('Permintaan upgrade berhasil dikirim. Silakan lakukan pembayaran dan tunggu konfirmasi admin.');
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPlan = user?.subscription_plan || 'free';
  
  const PLANS = [
    { 
      id: 'free', 
      name: 'Free (Tester)', 
      price: 'Rp 0', 
      features: ['Masa Aktif 3-5 Hari', 'Maks 1 Pegawai', 'Maks 20 Produk', 'Laporan Penjualan Dasar'],
      color: 'var(--text-muted)'
    },
    { 
      id: 'basic', 
      name: 'Basic', 
      price: 'Rp 149.000 / bln', 
      features: ['Tanpa Batas Waktu', 'Maks 5 Pegawai', 'Maks 500 Produk', 'Laporan Stok & Piutang'],
      color: 'var(--primary-500)'
    },
    { 
      id: 'pro', 
      name: 'Pro (Terbaik)', 
      price: 'Rp 299.000 / bln', 
      features: ['Tanpa Batas Waktu', 'Pegawai Tak Terbatas', 'Produk Tak Terbatas', 'Analitik Penuh & Multi Cabang'],
      color: '#8b5cf6' 
    }
  ];

  const staffLimit = currentPlan === 'free' ? 1 : (currentPlan === 'basic' ? 5 : '∞');
  const staffPercentage = staffLimit === '∞' ? 0 : (staffCount / staffLimit) * 100;

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Manajemen Langganan</h2>
          <p className="page-sub">Kelola paket billing dan kuota fitur toko Anda.</p>
        </div>
      </div>

      <style>{`
        .subscription-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .subscription-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="grid-2 subscription-grid">
        
        {/* Current Status Card */}
        <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, background: 'var(--primary-500)', opacity: 0.05, borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                   <span className="badge badge-blue" style={{ marginBottom: 8, display: 'inline-block', padding: '4px 12px', borderRadius: 20 }}>PAKET AKTIF</span>
                   <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{currentPlan.toUpperCase()}</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Status Akun</div>
                   {pendingReq ? (
                      <div style={{ color: 'var(--warning-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="animate-pulse">⏳</span> Menunggu Aktivasi
                      </div>
                   ) : (
                      <div style={{ color: 'var(--success-500)', fontWeight: 700 }}>✓ Terverifikasi</div>
                   )}
                </div>
            </div>

            <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>Kuota Pegawai</span>
                  <span style={{ fontWeight: 800 }}>{staffCount} / {staffLimit}</span>
               </div>
               <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, staffPercentage)}%`, height: '100%', background: staffPercentage > 90 ? 'var(--danger-500)' : 'var(--primary-500)', transition: 'width 1s ease' }} />
               </div>
               <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                  {currentPlan === 'free' 
                    ? 'Anda menggunakan paket Gratis. Batasan 4 pegawai berlaku.' 
                    : `Anda dalam paket ${currentPlan}. Nikmati kapasitas yang lebih luas.`}
               </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
             {PLANS.map(plan => (
               <div key={plan.id} className="card" style={{ padding: 24, border: currentPlan === plan.id ? `2px solid ${plan.color}` : '1px solid var(--border-color)', opacity: currentPlan !== plan.id && plan.id === 'free' ? 0.6 : 1, transform: currentPlan === plan.id ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.3s ease' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, color: plan.color }}>{plan.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>{plan.price}</div>
                  <ul style={{ padding: 0, margin: '0 0 24px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                     {plan.features.map((f, i) => (
                       <li key={i} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--success-500)' }}>✓</span> {f}
                       </li>
                     ))}
                  </ul>
                  {currentPlan === plan.id ? (
                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>Paket Anda</button>
                  ) : pendingReq?.plan === plan.id ? (
                    <button className="btn btn-warning" style={{ width: '100%', cursor: 'default' }} disabled>Dalam Proses...</button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', background: plan.id === 'pro' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : '', border: 'none' }}
                      onClick={() => { setSelectedPlan(plan); setShowOrderModal(true); }}
                      disabled={pendingReq !== null}
                    >
                      Pilih Paket
                    </button>
                  )}
               </div>
             ))}
          </div>
        </div>

        {/* Sidebar Help / Info */}
        <div className="card" style={{ padding: 24, background: 'var(--bg-elevated)' }}>
           <h3 style={{ marginTop: 0, marginBottom: 16 }}>Riwayat Tagihan</h3>
           <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ fontSize: 13 }}>Belum ada riwayat pembayaran yang tercatat.</p>
           </div>
           
           <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />
           
           <h3 style={{ marginBottom: 12 }}>Butuh Bantuan?</h3>
           <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Jika Anda mengalami kendala saat proses upgrade atau ingin melakukan pembayaran via Transfer Bank Manual, silakan hubungi tim support kami.
           </p>
           <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Hubungi Support UMKM</button>
        </div>

      </div>

      {/* MODAL ORDER & PEMBAYARAN */}
      <Modal isOpen={showOrderModal} onClose={() => !isSubmitting && setShowOrderModal(false)} title="Konfirmasi Upgrade Paket" maxWidth="500px">
         <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
               <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
               <p style={{ fontSize: 16 }}>Anda memilih paket <strong>{selectedPlan?.name}</strong></p>
               <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary-500)', margin: '8px 0' }}>{selectedPlan?.price}</h2>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)' }}>
               <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Instruksi Pembayaran:</h4>
               <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Silakan lakukan transfer sesuai nominal di atas ke rekening berikut:</p>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 8 }}>
                     <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>BANK BCA</div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>8837 001 992</div>
                     </div>
                     <button className="btn btn-sm btn-ghost" onClick={() => alert('Nomor Rekening Disalin!')}>Salin</button>
                  </div>
                  <div style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-muted)' }}>a.n. **PT Antigravity Global SaaS**</div>
               </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
               Setelah transfer, Admin akan memverifikasi pembayaran Anda dalam maksimal 1x24 jam.
            </p>

            <div className="modal__actions" style={{ display: 'flex', gap: 12 }}>
               <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowOrderModal(false)} disabled={isSubmitting}>Batal</button>
               <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleOrder} disabled={isSubmitting}>
                  {isSubmitting ? 'Mengirim...' : 'Saya Sudah Bayar'}
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
