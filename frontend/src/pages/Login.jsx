import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './Auth.css'
import bizoraLogo from '../assets/bizora-logo.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    api.get('/landing-settings')
      .then(r => {
        if (r.data?.data?.landing_logo_url) {
          setLogoUrl(r.data.data.landing_logo_url)
        }
      })
      .catch(e => console.error('Failed to fetch login page logo:', e))
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userData = await login(form.email, form.password)
      if (userData.role === 'super_admin') {
        navigate('/dashboard')
      } else {
        if (userData.business_category === 'Toko Retail') {
          navigate('/retail/dashboard')
        } else if (userData.business_category === 'Kuliner') {
          navigate('/kuliner/admin')
        } else if (userData.business_category === 'Budidaya Ikan' || userData.business_category === 'Budidaya Tanaman') {
          navigate('/budidaya/dashboard')
        } else {
          navigate('/coming-soon')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root" style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
      background: 'var(--bg-base)',
      fontFamily: 'Outfit, Inter, sans-serif'
    }}>
      <style>{`
        @media (max-width: 900px) {
          .login-root {
            grid-template-columns: 1fr !important;
          }
          .login-brand-panel {
            display: none !important;
          }
          .login-form-container {
            padding: 32px 20px !important;
          }
        }
      `}</style>

      {/* LEFT PANEL: BRAND & BENEFITS */}
      <div className="login-brand-panel" style={{
        background: 'linear-gradient(135deg, #0f172a, #0d9488)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(60px)' }} />

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 42, height: 42, background: '#fff', padding: '4px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={logoUrl || bizoraLogo} alt="BIZORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>BIZORA</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}>Platform Digital Terpadu</div>
          </div>
        </div>

        {/* Core benefits text */}
        <div style={{ zIndex: 10, margin: '80px 0' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.15)', padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Multi-Tenant SaaS
          </span>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', margin: '20px 0 16px 0', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            Kelola bisnis Anda dalam <span style={{ background: 'linear-gradient(120deg, #2dd4bf, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Satu Genggaman</span>
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 15, lineHeight: 1.7, maxWidth: 460 }}>
            Hubungkan kasir digital, kontrol persediaan stok, pengelolaan kolam budidaya, serta restoran kuliner dalam satu sistem terintegrasi yang andal.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 40 }}>
            {[
              { icon: '🛒', title: 'Toko Retail', desc: 'Kasir pintar POS, pencatatan otomatis, dan monitor stok.' },
              { icon: '🐟', title: 'Budidaya Ikan', desc: 'Siklus hidup kolam, jadwal pemberian pakan, & panen.' },
              { icon: '🍱', title: 'Kuliner', desc: 'Menu interaktif, pesanan online, resep, dan HPP otomatis.' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {item.icon}
                </div>
                <div>
                  <h4 style={{ color: '#fff', margin: '0 0 2px 0', fontSize: 14, fontWeight: 700 }}>{item.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0, fontSize: 12 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, zIndex: 10 }}>
          © 2026 BIZORA Indonesia. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: DEDICATED LOGIN CARD */}
      <div className="login-form-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        background: 'var(--bg-base)'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Masuk Akun</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Silakan masukkan detail akun Anda untuk melanjutkan ke dashboard.</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ef4444',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24
            }}>
              <span>🚨</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>EMAIL PENGGUNA</label>
              <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-default)', padding: '0 14px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 16, marginRight: 10 }}>✉️</span>
                <input 
                  name="email"
                  type="email" 
                  placeholder="contoh@bizora.id" 
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '14px 0',
                    width: '100%',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 12 }}>KATA SANDI</label>
              <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-default)', padding: '0 14px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 16, marginRight: 10 }}>🔒</span>
                <input 
                  name="password"
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '14px 0',
                    width: '100%',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: 14
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary-500)' }} /> Ingat saya
              </label>
              <a href="#" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontWeight: 600 }}>Lupa kata sandi?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #10b981, #0d9488)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Belum punya akun? <Link to="/register" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontWeight: 700 }}>Daftar Gratis</Link>
          </div>
          
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>←</span> Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
