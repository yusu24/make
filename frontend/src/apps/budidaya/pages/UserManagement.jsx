import React from 'react'
import '../budidaya.css'

export default function UserManagement() {
  const cardStyle = {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #E9F0EC'
  }

  const badge = (bg, color) => ({
    padding: '4px 12px',
    borderRadius: '40px',
    fontSize: '11px',
    fontWeight: '800',
    background: bg,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  })

  return (
    <div style={{ padding: '32px', background: '#F4F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '850', color: '#1B4332', margin: 0, letterSpacing: '-0.02em' }}>Manajemen Pengguna</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
            Kelola tingkat akses personel dan pantau sesi aktif di seluruh fasilitas.
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
          borderRadius: '12px', border: 'none', background: '#1B4332', 
          color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
          Tambah Pengguna Baru
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL STAF', val: '124', sub: '+4 bulan ini', subColor: '#059669', icon: 'groups', iconBg: '#D1FAE5', iconColor: '#059669' },
          { label: 'AKTIF SEKARANG', val: '48', sub: 'Di 12 tambak', subColor: '#64748B', icon: 'sensors', iconBg: '#D1FAE5', iconColor: '#059669' },
          { label: 'MANAJER', val: '12', sub: 'Administrator Sistem', subColor: '#64748B', icon: 'admin_panel_settings', iconBg: '#F1F5F9', iconColor: '#64748B' },
          { label: 'KESEHATAN KEAMANAN', val: '98%', sub: 'MFA diaktifkan', subColor: '#059669', icon: 'check_circle', iconBg: '#D1FAE5', iconColor: '#059669' }
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.08em' }}>{s.label}</p>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '10px', background: s.iconBg, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon}</span>
              </div>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '850', color: '#1A1C1A', margin: 0 }}>{s.val}</h2>
            <p style={{ fontSize: '12px', fontWeight: '600', color: s.subColor, marginTop: '4px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Table Section ── */}
      <div style={cardStyle}>
        {/* Search & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <span className="material-symbols-outlined" style={{ 
              position: 'absolute', left: '16px', top: '12px', color: '#94A3B8', fontSize: '20px' 
            }}>search</span>
            <input 
              placeholder="Cari berdasarkan nama, email atau peran..." 
              style={{ 
                width: '100%', padding: '12px 16px 12px 48px', background: '#F1F5F9', 
                border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
              borderRadius: '12px', border: '1.5px solid #E9F0EC', background: '#fff', 
              color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' 
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
              Filter
            </button>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
              borderRadius: '12px', border: '1.5px solid #E9F0EC', background: '#fff', 
              color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' 
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
              Ekspor
            </button>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1.5px solid #F1F5F9' }}>
              <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Spesialis Budidaya Perairan</th>
              <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Peran</th>
              <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Terakhir Aktif</th>
              <th style={{ padding: '0 0 16px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Alexander Rivers', role: 'ADMIN', roleBg: '#D1FAE5', roleColor: '#059669', email: 'a.rivers@aquapulse.io', status: 'AKTIF', statusColor: '#059669', last: 'Baru saja', img: 'https://i.pravatar.cc/150?u=a' },
              { name: 'Elena Chen', role: 'MANAJER', roleBg: '#D1FAE5', roleColor: '#059669', email: 'e.chen@aquapulse.io', status: 'AKTIF', statusColor: '#059669', last: '12 menit yang lalu', img: 'https://i.pravatar.cc/150?u=e' },
              { name: 'Marcus Wright', role: 'PEKERJA', roleBg: '#F1F5F9', roleColor: '#64748B', email: 'm.wright@aquapulse.io', status: 'TIDAK AKTIF', statusColor: '#94A3B8', last: '2 hari yang lalu', img: 'https://i.pravatar.cc/150?u=m' },
              { name: 'Sarah Jenkins', role: 'MANAJER', roleBg: '#D1FAE5', roleColor: '#059669', email: 's.jenkins@aquapulse.io', status: 'AKTIF', statusColor: '#059669', last: '1 jam yang lalu', img: 'https://i.pravatar.cc/150?u=s' }
            ].map((u, i) => (
              <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid #F1F5F9' }}>
                <td style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={u.img} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: '#1B4332', margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Spesialis Budidaya</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>{u.email}</td>
                <td style={{ padding: '16px 0' }}>
                  <span style={badge(u.roleBg, u.roleColor)}>{u.role}</span>
                </td>
                <td style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.statusColor }}></span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: u.statusColor }}>{u.status}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>{u.last}</td>
                <td style={{ padding: '16px 0' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1.5px solid #F1F5F9' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8' }}>Menampilkan 1 sampai 4 dari 124 pengguna</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E9F0EC', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            {[1, 2, 3, '...', 31].map((p, i) => (
              <button key={i} style={{ 
                width: '32px', height: '32px', borderRadius: '8px', border: 'none', 
                background: p === 1 ? '#1B4332' : 'transparent', 
                color: p === 1 ? '#fff' : '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' 
              }}>{p}</button>
            ))}
            <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E9F0EC', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Access Policies */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Ikhtisar Kebijakan Akses</h3>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', 
              color: '#059669', fontSize: '13px', fontWeight: '700', cursor: 'pointer' 
            }}>
              Pengaturan Kebijakan
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '24px', background: '#F8FAF9', borderRadius: '20px', border: '1px solid #E9F0EC' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>security</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 8px' }}>Autentikasi Multi-Faktor</h4>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                Diterapkan untuk semua peran Manajer dan Admin. Direkomendasikan bagi Pekerja yang mengakses data tambak kritis.
              </p>
            </div>
            <div style={{ padding: '24px', background: '#F8FAF9', borderRadius: '20px', border: '1px solid #E9F0EC' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>history</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 8px' }}>Sesi Berakhir Otomatis</h4>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                Sesi aktif secara otomatis dihentikan setelah 45 menit ketidakaktifan untuk memastikan keamanan.
              </p>
            </div>
          </div>
        </div>

        {/* Mass Import */}
        <div style={{ ...cardStyle, background: '#1B4332', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '850', color: '#fff', margin: '0 0 16px', lineHeight: '1.3' }}>Butuh Impor pengguna massal?</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
              Unggah file CSV untuk menambahkan beberapa staf sekaligus ke kluster fasilitas tertentu.
            </p>
          </div>
          <button style={{ 
            marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
            padding: '14px', borderRadius: '12px', border: 'none', background: '#059669', 
            color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>
            Unggah CSV Pengguna
          </button>
        </div>

      </div>

    </div>
  )
}
