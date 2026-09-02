import React, { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import '../budidaya.css'
import { useBudidayaContext } from '../contexts/BudidayaContext'

export default function Settings() {
  const { user } = useAuth()
  const { terms, farmType, farmName, updateFarmSettings } = useBudidayaContext()
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formFarmType, setFormFarmType] = useState(farmType)
  const [formFarmName, setFormFarmName] = useState(farmName || '')

  React.useEffect(() => {
    setFormFarmType(farmType)
    setFormFarmName(farmName || '')
  }, [farmType, farmName])

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 13px',
    background: '#ffffff',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '400',
    marginTop: '4px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '2px',
    display: 'block',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  }

  const sectionHeader = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1B4332' }}>{icon}</span>
      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', margin: 0, fontFamily: "'Inter', sans-serif" }}>{title}</h3>
    </div>
  )

  const toggleRow = (icon, title, desc, active) => (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', 
      background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        width: '34px', height: '34px', borderRadius: '8px', background: '#E8F5ED', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', shrink: 0
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', margin: 0 }}>{desc}</p>
      </div>
      <div style={{ 
        width: '40px', height: '22px', borderRadius: '11px', 
        background: active ? '#1B4332' : '#CBD5E1', 
        position: 'relative', cursor: 'pointer', transition: '0.2s', shrink: 0
      }}>
        <div style={{ 
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '3px', left: active ? '21px' : '3px',
          transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }} />
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Memuat pengaturan...</p>
    </div>
  )

  return (
    <div className="aq-container" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .settings-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
          .header-actions { width: 100%; display: flex; gap: 12px; }
          .header-actions button { flex: 1; justify-content: center; padding: 10px 8px !important; font-size: 12px !important; }
          .pref-grid { grid-template-columns: 1fr !important; }
          .aq-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      
      <div className="aq-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start', gap: '20px' }}>
        
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Informasi Pribadi */}
          <div style={cardStyle}>
            {sectionHeader('person', 'Informasi Profil')}
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '88px', height: '88px', borderRadius: '16px', overflow: 'hidden', 
                  border: '3px solid #E8F5ED', background: '#F1F5F9' 
                }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1B4332&color=fff&size=200`} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ 
                  position: 'absolute', bottom: '-6px', right: '-6px', 
                  width: '28px', height: '28px', borderRadius: '8px', background: '#1B4332',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  cursor: 'pointer', border: '2px solid #fff'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>photo_camera</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginTop: '10px', margin: 0 }}>Foto Profil</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <input style={inputStyle} defaultValue={user?.name || 'Pengguna'} disabled />
              </div>
              <div>
                <label style={labelStyle}>Alamat Email</label>
                <input style={inputStyle} defaultValue={user?.email || 'user@bizora.id'} disabled />
              </div>
            </div>
          </div>
          
          {/* Pengaturan Bisnis Budidaya */}
          <div style={cardStyle}>
            {sectionHeader('storefront', 'Bisnis Budidaya')}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nama Peternakan / Budidaya</label>
                <input 
                  style={inputStyle} 
                  value={formFarmName} 
                  onChange={e => setFormFarmName(e.target.value)}
                  placeholder="Misal: AquaGrow Farm" 
                />
              </div>
              <div>
                <label style={labelStyle}>Tipe Budidaya</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    style={{ ...inputStyle, appearance: 'none' }} 
                    value={formFarmType}
                    onChange={e => setFormFarmType(e.target.value)}
                  >
                    <option value="ikan">Ikan / Hewan Air</option>
                    <option value="unggas">Unggas (Ayam, Bebek)</option>
                    <option value="ruminansia">Ruminansia (Sapi, Kambing)</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', right: '12px', top: '12px', color: '#64748b', pointerEvents: 'none', fontSize: '18px' 
                  }}>expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keamanan */}
          <div style={cardStyle}>
            {sectionHeader('lock', 'Keamanan Akun')}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Kata Sandi Saat Ini</label>
                <input style={inputStyle} type="password" defaultValue="********" />
              </div>
              <div>
                <label style={labelStyle}>Kata Sandi Baru</label>
                <input style={inputStyle} type="password" placeholder="Masukkan kata sandi baru" />
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Pengaturan Notifikasi */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              {sectionHeader('notifications', 'Pengaturan Notifikasi')}
              <span className="badge-pill badge-pill-success" style={{ fontSize: '11px' }}>Otomatis</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {toggleRow(terms.isTanaman ? 'eco' : 'restaurant', terms.isTanaman ? 'Pengingat Pupuk' : 'Pengingat Pakan', terms.isTanaman ? "Dapatkan notifikasi saat waktunya memberi pupuk/nutrisi." : `Dapatkan notifikasi saat waktunya pemberian pakan harian.`, true)}
              {toggleRow('opacity', terms.isTanaman ? 'Peringatan Kondisi Lahan' : `Peringatan Kondisi ${terms.unit}`, terms.isTanaman ? "Peringatan kritis untuk kelembaban tanah, pH tanah, atau suhu." : `Peringatan kritis untuk suhu, kadar amonia, atau sanitasi ${terms.unitLower}.`, true)}
              {toggleRow('analytics', 'Laporan Analisa Mingguan', `Ringkasan email tentang kesehatan ${terms.unitLower} dan performa pertumbuhan.`, false)}
            </div>
          </div>

          {/* Preferensi Aplikasi */}
          <div style={cardStyle}>
            {sectionHeader('tune', 'Preferensi Aplikasi')}
            
            <div className="pref-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Bahasa</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, appearance: 'none' }}>
                    <option>Bahasa Indonesia</option>
                    <option>English (US)</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ 
                    position: 'absolute', right: '10px', top: '12px', color: '#64748b', pointerEvents: 'none', fontSize: '18px' 
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
                    position: 'absolute', right: '10px', top: '12px', color: '#64748b', pointerEvents: 'none', fontSize: '18px' 
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
                    position: 'absolute', right: '10px', top: '12px', color: '#64748b', pointerEvents: 'none', fontSize: '18px' 
                  }}>expand_more</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tema Tampilan</label>
                <div style={{ 
                  marginTop: '4px', background: '#F1F5F9', padding: '3px', 
                  borderRadius: '8px', display: 'flex', gap: '4px' 
                }}>
                  <button 
                    onClick={() => setTheme('light')}
                    style={{ 
                      flex: 1, padding: '6px 8px', borderRadius: '6px', border: 'none',
                      background: theme === 'light' ? '#fff' : 'transparent',
                      color: theme === 'light' ? '#1B4332' : '#64748b',
                      fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>light_mode</span>
                    Terang
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    style={{ 
                      flex: 1, padding: '6px 8px', borderRadius: '6px', border: 'none',
                      background: theme === 'dark' ? '#fff' : 'transparent',
                      color: theme === 'dark' ? '#1B4332' : '#64748b',
                      fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>dark_mode</span>
                    Gelap
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Footer Actions ── */}
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px' }}>
        <button style={{ 
          padding: '8px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', 
          background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          Batalkan
        </button>
        <button 
          onClick={async () => {
            setSaving(true)
            await updateFarmSettings(formFarmType, formFarmName)
            setSaving(false)
            alert('Pengaturan berhasil disimpan')
          }}
          style={{ 
            padding: '8px 20px', borderRadius: '8px', border: 'none', 
            background: '#1B4332', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

    </div>
  )
}
