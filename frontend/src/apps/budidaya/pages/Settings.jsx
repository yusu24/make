import React, { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import '../budidaya.css'

export default function Settings() {
  const { user } = useAuth()
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const cardStyle = {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
    border: '1px solid #E9F0EC'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1A1C1A',
    fontWeight: '500',
    marginTop: '8px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '6px',
    display: 'block'
  }

  const sectionHeader = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#1B4332' }}>{icon}</span>
      <h3 className="aq-section-title">{title}</h3>
    </div>
  )

  const toggleRow = (icon, title, desc, active) => (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', 
      background: '#F8FAF9', borderRadius: '16px', border: '1px solid #E9F0EC' 
    }}>
      <div style={{ 
        width: '40px', height: '40px', borderRadius: '10px', background: '#E8F5ED', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' 
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A1C1A', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{desc}</p>
      </div>
      <div style={{ 
        width: '44px', height: '24px', borderRadius: '12px', 
        background: active ? '#1B4332' : '#E2E8F0', 
        position: 'relative', cursor: 'pointer', transition: '0.2s' 
      }}>
        <div style={{ 
          width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '3px', left: active ? '23px' : '3px',
          transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }} />
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat pengaturan...</p>
    </div>
  )

  return (
    <div className="aq-container">
      <style>{`
        @media (max-width: 768px) {
          .settings-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
          .header-actions { width: 100%; display: flex; gap: 12px; }
          .header-actions button { flex: 1; justify-content: center; padding: 12px 8px !important; font-size: 12px !important; }
          .pref-grid { grid-template-columns: 1fr !important; }
          .aq-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      
      {/* ── Header ── */}
      <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="aq-page-title">Pengaturan profil</h1>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <button style={{ 
            padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #E9F0EC', 
            background: '#fff', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            Batalkan
          </button>
          <button style={{ 
            padding: '12px 24px', borderRadius: '12px', border: 'none', 
            background: '#1B4332', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="aq-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
        
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Informasi Pribadi */}
          <div style={cardStyle}>
            {sectionHeader('person', 'Informasi Pribadi')}
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '120px', height: '120px', borderRadius: '24px', overflow: 'hidden', 
                  border: '4px solid #E8F5ED', background: '#F1F5F9' 
                }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1B4332&color=fff&size=200`} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ 
                  position: 'absolute', bottom: '-10px', right: '-10px', 
                  width: '36px', height: '36px', borderRadius: '10px', background: '#1B4332',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  cursor: 'pointer', border: '3px solid #fff'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                </div>
              </div>
              <p className="aq-small-text" style={{ fontWeight: '700', marginTop: '20px' }}>Foto profil</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <input style={inputStyle} defaultValue={user?.name || 'Aris Setiawan'} />
              </div>
              <div>
                <label style={labelStyle}>Alamat Email</label>
                <input style={inputStyle} defaultValue={user?.email || 'aris.setiawan@aquagrow.io'} />
              </div>
            </div>
          </div>

          {/* Keamanan */}
          <div style={cardStyle}>
            {sectionHeader('lock', 'Keamanan')}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Kata Sandi Saat Ini</label>
                <input style={inputStyle} type="password" defaultValue="********" />
              </div>
              <div>
                <label style={labelStyle}>Kata Sandi Baru</label>
                <input style={inputStyle} type="password" placeholder="Masukkan kata sandi baru" />
              </div>
              <button style={{ 
                marginTop: '10px', padding: '12px', borderRadius: '12px', border: '1.5px dashed #1B4332', 
                background: '#F0FAF4', color: '#1B4332', fontWeight: '700', cursor: 'pointer', fontSize: '13px' 
              }}>
                Aktifkan Autentikasi Dua Faktor
              </button>
            </div>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pengaturan Notifikasi */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              {sectionHeader('notifications', 'Pengaturan notifikasi')}
              <span className="aq-small-text" style={{ 
                fontWeight: '700', background: '#D1FAE5', 
                color: '#059669', padding: '4px 10px', borderRadius: '40px' 
              }}>Otomatis</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {toggleRow('restaurant', 'Pengingat Pakan', "Dapatkan notifikasi saat waktunya memberi makan ikan.", true)}
              {toggleRow('opacity', 'Peringatan Kualitas Air', "Peringatan kritis untuk kadar pH, amonia, atau oksigen.", true)}
              {toggleRow('analytics', 'Laporan Analisa Mingguan', "Ringkasan email tentang kesehatan kolam dan performa pertumbuhan.", false)}
            </div>
          </div>

          {/* Preferensi Aplikasi */}
          <div style={cardStyle}>
            {sectionHeader('tune', 'Preferensi Aplikasi')}
            
            <div className="pref-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Bahasa</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, appearance: 'none' }}>
                    <option>Bahasa Indonesia</option>
                    <option>English (US)</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', right: '12px', top: '18px', color: '#475569', pointerEvents: 'none' 
                  }}>expand_more</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Satuan Ukuran</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, appearance: 'none' }}>
                    <option>Metrik (Celsius, kg, m³)</option>
                    <option>Imperial (Fahrenheit, lb, ft³)</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', right: '12px', top: '18px', color: '#475569', pointerEvents: 'none' 
                  }}>expand_more</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Laju Refresh Dashboard</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, appearance: 'none' }}>
                    <option>Real-time (Langsung)</option>
                    <option>Setiap 5 Menit</option>
                    <option>Setiap 15 Menit</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', right: '12px', top: '18px', color: '#475569', pointerEvents: 'none' 
                  }}>expand_more</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tema</label>
                <div style={{ 
                  marginTop: '8px', background: '#F1F5F9', padding: '4px', 
                  borderRadius: '12px', display: 'flex', gap: '4px' 
                }}>
                  <button 
                    onClick={() => setTheme('light')}
                    style={{ 
                      flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                      background: theme === 'light' ? '#fff' : 'transparent',
                      color: theme === 'light' ? '#1B4332' : '#475569',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>light_mode</span>
                    Terang
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    style={{ 
                      flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                      background: theme === 'dark' ? '#fff' : 'transparent',
                      color: theme === 'dark' ? '#1B4332' : '#475569',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dark_mode</span>
                    Gelap
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
