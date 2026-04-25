import React, { useState } from 'react'
import '../budidaya.css'

export default function RolesPermissions() {
  const [activeRole, setActiveRole] = useState('Manajer Tambak')

  const cardStyle = {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #E9F0EC'
  }

  const roleCard = (title, icon, badgeText, badgeColor, badgeBg, isEditing) => (
    <div 
      onClick={() => setActiveRole(title)}
      style={{ 
        ...cardStyle, 
        padding: '24px',
        flex: 1,
        cursor: 'pointer',
        border: isEditing ? '2px solid #1B4332' : '1px solid #E9F0EC',
        position: 'relative',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ 
          width: '44px', height: '44px', borderRadius: '12px', background: '#F1F5F9', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' 
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
        </div>
        {badgeText && (
          <span style={{ 
            fontSize: '9px', fontWeight: '800', background: badgeBg, 
            color: badgeColor, padding: '3px 8px', borderRadius: '40px',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>{badgeText}</span>
        )}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', margin: '0 0 20px' }}>
        Mengonfigurasi: <span style={{ color: '#1B4332' }}>Manajer Tambak</span>
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1B4332', fontSize: '13px', fontWeight: '700' }}>
        {isEditing ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
            Sedang Dipilih
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Edit Izin
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </span>
        )}
      </div>
    </div>
  )

  const permissionItem = (title, desc, active) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A1C1A', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{desc}</p>
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

  return (
    <div style={{ padding: '32px', background: '#F4F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '850', color: '#1B4332', margin: 0, letterSpacing: '-0.02em' }}>Peran & Izin</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', maxWidth: '600px', lineHeight: '1.5' }}>
            Konfigurasi tingkat akses administratif dan tentukan izin fitur khusus untuk anggota tim Anda di seluruh ekosistem akuakultur.
          </p>
        </div>
        <button style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
          borderRadius: '12px', border: 'none', background: '#1B4332', 
          color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_moderator</span>
          Buat Peran Baru
        </button>
      </div>

      {/* ── Role Selection ── */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {roleCard('Admin', 'admin_panel_settings', 'BAWAAN SISTEM', '#059669', '#D1FAE5', activeRole === 'Admin')}
        {roleCard('Manajer Tambak', 'manage_accounts', 'MENGEDIT', '#fff', '#1A1C1A', activeRole === 'Manajer Tambak')}
        {roleCard('Pekerja Lapangan', 'engineering', null, null, null, activeRole === 'Pekerja Lapangan')}
      </div>

      {/* ── Permission Matrix ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Matriks Izin</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600', marginTop: '4px' }}>
              Mengonfigurasi: <span style={{ color: '#1B4332' }}>{activeRole}</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Batalkan Perubahan
            </button>
            <button style={{ 
              padding: '12px 28px', borderRadius: '12px', border: 'none', background: '#1B4332', 
              color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
            }}>
              Simpan Matriks
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Category: Data & Analitik */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>analytics</span>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Data & Analitik</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
              {permissionItem('Lihat Laporan', 'Akses semua bagan kinerja', true)}
              {permissionItem('Ekspor Data', 'Unduh laporan CSV/PDF', true)}
              {permissionItem('Bagikan Analitik', 'Kirim laporan ke email eksternal', false)}
            </div>
          </section>

          {/* Category: Operasi Tambak */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>water_drop</span>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Operasi Tambak</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
              {permissionItem('Kelola Kolam', 'Buat dan edit parameter kolam', true)}
              {permissionItem('Hapus Kolam', 'Hapus catatan kolam secara permanen', false)}
              {permissionItem('Ganti Alarm', 'Abaikan peringatan kesehatan kritis', true)}
            </div>
          </section>

          {/* Category: Manajemen Tim */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>groups</span>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Manajemen Tim</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
              {permissionItem('Tambah Pengguna', 'Undang staf baru ke tambak', true)}
              {permissionItem('Edit Peran Pengguna', 'Ubah tingkat izin', false)}
              {permissionItem('Hapus Pengguna', 'Cabut semua akses segera', false)}
            </div>
          </section>
        </div>
      </div>

      {/* ── Important Note ── */}
      <div style={{ 
        display: 'flex', gap: '16px', padding: '24px', background: '#D8F3DC', 
        borderRadius: '20px', border: '1px solid #B7E4C7', alignItems: 'flex-start' 
      }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '50%', background: '#fff', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', flexShrink: 0 
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1B4332', margin: '0 0 6px' }}>Catatan Penting</h4>
          <p style={{ fontSize: '13px', color: '#2D6A4F', lineHeight: '1.6', margin: 0 }}>
            Perubahan pada peran <span style={{ fontWeight: '800' }}>Manajer Tambak</span> akan memengaruhi <span style={{ textDecoration: 'underline', fontWeight: '700' }}>14 pengguna aktif</span> di 3 wilayah. Semua pengguna yang terpengaruh akan menerima pemberitahuan tentang pembaruan hak akses mereka setelah disimpan.
          </p>
        </div>
      </div>

    </div>
  )
}
