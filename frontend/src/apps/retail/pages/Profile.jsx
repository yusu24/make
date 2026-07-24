import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Store, MapPin, Lock, Save, Camera } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import '../retail.css'

export default function RetailProfile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [store, setStore] = useState({
    storeName: '',
    address: '',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  useEffect(() => {
    api.get('/retail/settings')
      .then(res => setStore({
        storeName: res.data?.store_name || '',
        address: res.data?.store_address || '',
      }))
      .catch(() => {})
  }, [])

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { name: profile.name, phone: profile.phone })
      updateUser(res.data.data)
      alert('Profil berhasil disimpan!')
    } catch (err) {
      alert(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStore = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/retail/settings', { store_name: store.storeName, store_address: store.address })
      alert('Pengaturan toko berhasil disimpan!')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan toko')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      alert('Password baru tidak cocok!')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/password', {
        current_password: passwords.current,
        password: passwords.new,
        password_confirmation: passwords.confirm,
      })
      setPasswords({ current: '', new: '', confirm: '' })
      alert('Password berhasil diubah!')
    } catch (err) {
      alert(err.response?.data?.errors?.current_password?.[0] || err.response?.data?.errors ? Object.values(err.response?.data?.errors || {}).flat().join(', ') : 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
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
            type="button"
            onClick={() => alert('Fitur unggah foto profil belum tersedia.')}
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
        <form onSubmit={handleSaveStore} className="airy-card" style={{ padding: '32px' }}>
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
                value={store.storeName}
                onChange={(e) => setStore({ ...store, storeName: e.target.value })}
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
                value={store.address}
                onChange={(e) => setStore({ ...store, address: e.target.value })}
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
