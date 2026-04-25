import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import '../../../pages/Auth.css'
import './Shared.css'

export default function Profile() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [error, setError]     = useState('')
  const [showCurPass, setShowCurPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg(''); setError('')
    try {
      await api.put('/profile', { name: form.name, email: form.email })
      setMsg('Profil berhasil diperbarui!')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil')
    } finally { setSaving(false) }
  }

  const handleChangePass = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.new_password_confirmation) { setError('Konfirmasi password tidak cocok'); return }
    setSaving(true); setMsg(''); setError('')
    try {
      await api.put('/profile/password', {
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      })
      setMsg('Password berhasil diubah!')
      setForm(f => ({...f, current_password:'', new_password:'', new_password_confirmation:''}))
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password')
    } finally { setSaving(false) }
  }

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="animate-fade-in" style={{maxWidth:720, margin:'0 auto'}}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Profil Saya</h2>
          <p className="page-sub">Kelola informasi akun Anda</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card card-pad" style={{marginBottom:20}}>
        <div style={{display:'flex', alignItems:'center', gap:20, marginBottom:24}}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg, var(--primary-600), var(--accent-600))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:800, color:'white',
            boxShadow:'0 8px 24px rgba(59,130,246,0.35)',
            flexShrink:0
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{fontFamily:'var(--font-heading)',fontSize:20,fontWeight:800,marginBottom:4}}>{user?.name}</h3>
            <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:8}}>{user?.email}</p>
            <div style={{display:'flex', gap:8}}>
              <span className={`badge ${user?.role==='super_admin'?'badge-violet':user?.role==='admin'?'badge-blue':'badge-green'}`}>
                {user?.role==='super_admin' ? '⭐ Super Admin' : user?.role==='admin' ? '🔧 Admin' : '📦 Customer'}
              </span>
              {user?.business_category && (
                <span className="badge badge-blue">{user.business_category}</span>
              )}
            </div>
          </div>
        </div>

        {msg && <div className="auth-alert auth-alert--success" style={{marginBottom:16}}><span>✓</span> {msg}</div>}
        {error && <div className="auth-alert auth-alert--error" style={{marginBottom:16}}><span>⚠</span> {error}</div>}

        <form id="form-profile" onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:16}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Informasi Akun</h4>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-name">Nama Lengkap</label>
              <input id="prof-name" className="form-input" value={form.name}
                onChange={e => setForm({...form, name:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-email">Email</label>
              <input id="prof-email" className="form-input" type="email" value={form.email}
                onChange={e => setForm({...form, email:e.target.value})} />
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <button id="btn-save-profile" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Menyimpan...</> : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card card-pad">
        <form id="form-change-pass" onSubmit={handleChangePass} style={{display:'flex',flexDirection:'column',gap:16}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Ubah Password</h4>
          <div className="form-group">
            <label className="form-label" htmlFor="cur-pass">Password Saat Ini</label>
            <div className="auth-input-wrap">
              <input id="cur-pass" className="form-input" type={showCurPass ? 'text' : 'password'} placeholder="••••••••"
                style={{paddingRight:40}}
                value={form.current_password} onChange={e=>setForm({...form,current_password:e.target.value})} />
              <button type="button" className="auth-eye" onClick={() => setShowCurPass(!showCurPass)}>
                {showCurPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pass">Password Baru</label>
              <div className="auth-input-wrap">
                <input id="new-pass" className="form-input" type={showNewPass ? 'text' : 'password'} placeholder="Min. 8 karakter"
                  style={{paddingRight:40}}
                  value={form.new_password} onChange={e=>setForm({...form,new_password:e.target.value})} />
                <button type="button" className="auth-eye" onClick={() => setShowNewPass(!showNewPass)}>
                  {showNewPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass">Konfirmasi Password</label>
              <div className="auth-input-wrap">
                <input id="confirm-pass" className="form-input" type={showConfPass ? 'text' : 'password'} placeholder="Ulangi password baru"
                  style={{paddingRight:40}}
                  value={form.new_password_confirmation} onChange={e=>setForm({...form,new_password_confirmation:e.target.value})} />
                <button type="button" className="auth-eye" onClick={() => setShowConfPass(!showConfPass)}>
                  {showConfPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <button id="btn-change-pass" type="submit" className="btn btn-secondary" disabled={saving}>
              🔐 Ubah Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card card-pad" style={{marginTop:20, border:'1px solid rgba(239,68,68,0.2)'}}>
        <h4 style={{fontSize:13,fontWeight:700,color:'var(--danger-400)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>
          ⚠ Zona Berbahaya
        </h4>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:14,fontWeight:600,marginBottom:4}}>Keluar dari Sesi</p>
            <p style={{fontSize:12,color:'var(--text-muted)'}}>Anda akan keluar dari semua session aktif</p>
          </div>
          <button id="btn-logout-profile" className="btn btn-danger btn-sm" onClick={logout}>Keluar Sekarang</button>
        </div>
      </div>
    </div>
  )
}
