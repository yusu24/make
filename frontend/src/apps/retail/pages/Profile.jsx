import React, { useState } from 'react'
import { User, Mail, Phone, Store, MapPin, Lock, Save, Camera } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import '../retail.css'

export default function RetailProfile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '08123456789',
    storeName: user?.store_name || 'Toko Saya',
    address: user?.address || 'Jl. Contoh No. 1, Jakarta',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    // Simulate save
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    alert('Profil berhasil disimpan!')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      alert('Password baru tidak cocok!')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setPasswords({ current: '', new: '', confirm: '' })
    alert('Password berhasil diubah!')
  }

  const tabs = [
    { id: 'info', label: 'Informasi Akun', icon: <User size={16} /> },
    { id: 'store', label: 'Pengaturan Toko', icon: <Store size={16} /> },
    { id: 'security', label: 'Keamanan', icon: <Lock size={16} /> },
  ]

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Avatar & Info Card */}
      <div className="airy-card flex items-center gap-6" style={{ marginBottom: 28, padding: '24px 32px' }}>
        <div style={{
          position: 'relative',
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--retail-primary), #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 26, fontWeight: 800, flexShrink: 0,
          boxShadow: '0 8px 20px rgba(67, 24, 255, 0.2)'
        }}>
          {initials}
          <button
            style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--retail-card-bg)', border: '2px solid var(--retail-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title="Ganti foto"
          >
            <Camera size={13} className="retail-text-secondary" />
          </button>
        </div>
        <div>
          <h2 className="retail-text-primary text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-body)' }}>
            {profile.name}
          </h2>
          <p className="retail-text-secondary text-sm mb-2">{profile.email}</p>
          <span className="retail-badge retail-badge-primary">
            Toko Retail
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--retail-border)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--retail-primary)' : 'var(--retail-text-secondary)',
              borderBottom: activeTab === tab.id ? '3px solid var(--retail-primary)' : '3px solid transparent',
              marginBottom: -1,
              transition: 'all 0.2s ease',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveProfile} className="airy-card" style={{ padding: '32px' }}>
          <h3 className="retail-card-title text-lg mb-6" style={{ borderBottom: '1px dashed var(--retail-border)', paddingBottom: 12 }}>
            Informasi Akun
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                <User size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                Nama Lengkap
              </label>
              <input
                type="text" className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                <Mail size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                Alamat Email
              </label>
              <input
                type="email" className="form-input"
                value={profile.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--retail-bg)' }}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                <Phone size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                No. Telepon / WhatsApp
              </label>
              <input
                type="text" className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button type="submit" className="btn btn-primary px-8 h-[42px]" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'store' && (
        <form onSubmit={handleSaveProfile} className="airy-card" style={{ padding: '32px' }}>
          <h3 className="retail-card-title text-lg mb-6" style={{ borderBottom: '1px dashed var(--retail-border)', paddingBottom: 12 }}>
            Pengaturan Toko
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                <Store size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                Nama Toko Retail
              </label>
              <input
                type="text" className="form-input"
                value={profile.storeName}
                onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                Alamat Fisik Toko
              </label>
              <textarea
                className="form-input"
                rows={4}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                style={{ resize: 'vertical', minHeight: 100 }}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button type="submit" className="btn btn-primary px-8 h-[42px]" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="airy-card" style={{ padding: '32px' }}>
          <h3 className="retail-card-title text-lg mb-6" style={{ borderBottom: '1px dashed var(--retail-border)', paddingBottom: 12 }}>
            Ubah Password
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Password Saat Ini</label>
              <input
                type="password" className="form-input"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Password Baru</label>
              <input
                type="password" className="form-input"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                required minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Konfirmasi Password Baru</label>
              <input
                type="password" className="form-input"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required minLength={6}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button type="submit" className="btn btn-primary px-8 h-[42px]" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} /> {saving ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
