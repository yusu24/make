import React from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useAuth } from '../../../contexts/AuthContext';
import './KulinerDashboard.css';

const MarketingDesign = () => {
  const { user } = useAuth();
  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Desain & Flyer Promosi</h1>
          <p className="text-sm text-slate-500 mt-1">Gunakan materi promosi premium ini untuk meningkatkan penjualan Anda.</p>
        </div>
      </div>

      <div className="kd-content">
        <div className="kd-panel">
          <div className="kd-panel-header">
            <div className="text-sm font-bold text-slate-800">Koleksi Desain {user?.tenant_name || 'Toko'}</div>
            <div className="text-xs text-slate-400">Siap Cetak & Posting</div>
          </div>
          
          <div className="p-8">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 32 }}>
              {/* Item 1: Flyer Cetak */}
              <div className="kd-panel p-0 overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div style={{ position: 'relative' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800" 
                    alt="Flyer Promo" 
                    style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} 
                  />
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="kd-status-badge kd-status-active" style={{ background: '#b48c36', color: '#fff' }}>Best Seller</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-extrabold text-slate-800 text-lg mb-2">Flyer Menu Nusantara (A4)</h4>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">Desain poster premium untuk dipajang di toko atau dibagikan secara fisik kepada pelanggan di sekitar lokasi usaha Anda.</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="kd-btn kd-btn-primary" style={{ flex: 1 }}>⬇ Unduh File Cetak</button>
                    <button className="kd-btn kd-btn-secondary" style={{ flex: 1 }}>👁 Pratinjau</button>
                  </div>
                </div>
              </div>

              {/* Item 2: Social Media Story */}
              <div className="kd-panel p-0 overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" 
                    alt="Social Story" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                  />
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="kd-status-badge kd-status-active" style={{ background: '#10b981', color: '#fff' }}>Instagram Ready</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-extrabold text-slate-800 text-lg mb-2">Template Story Instagram/WA</h4>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">Format vertikal yang dioptimalkan untuk media sosial. Sangat efektif untuk memberi tahu pelanggan tentang promo hari ini melalui status WhatsApp.</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="kd-btn kd-btn-primary" style={{ flex: 1 }}>⬇ Unduh Materi Sosial</button>
                    <button className="kd-btn kd-btn-secondary" style={{ flex: 1 }}>👁 Pratinjau Full</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 40, padding: 32, background: 'linear-gradient(135deg, #fdfcf9 0%, #f7f1e6 100%)', borderRadius: 24, border: '1px dashed #b48c36' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ fontSize: 48 }}>💡</div>
                <div>
                  <h5 className="font-bold text-[#8a6a2a] text-lg mb-1">Tips Promosi Kilat!</h5>
                  <p className="text-sm text-[#b48c36]/80 max-w-3xl leading-relaxed">Gunakan flyer ini di hari Jumat (Jumat Berkah) atau saat ada menu baru. Jangan lupa untuk mencantumkan link menu online Anda agar pelanggan bisa memesan langsung dari ponsel mereka. Konsistensi visual akan membuat toko Anda terlihat lebih terpercaya dan premium.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KulinerAdminLayout>
  );
};

export default MarketingDesign;
