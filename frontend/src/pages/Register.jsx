import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './Auth.css'
import bizoraLogo from '../assets/bizora-logo.png'

const CATEGORY_ICONS = {
  'Budidaya Ikan':    'ti-fish',
  'Budidaya Tanaman': 'ti-leaf',
  'Toko Retail':      'ti-shopping-cart',
  'Jasa':             'ti-briefcase',
  'Manufaktur':       'ti-building-factory-2',
  'Kuliner':          'ti-tools-kitchen-2',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    business_category_id: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    api.get('/categories/public').then(res => {
      setCategories(res.data?.data || [])
    }).catch(() => {
      setCategories([
        { id: 1, name: 'Budidaya Ikan' },
        { id: 2, name: 'Toko Retail' },
        { id: 3, name: 'Jasa' },
        { id: 4, name: 'Manufaktur' },
        { id: 5, name: 'Kuliner' },
      ])
    })

    api.get('/landing-settings').then(res => {
      if (res.data?.data?.landing_logo_url) {
        setLogoUrl(res.data.data.landing_logo_url)
      }
    }).catch(e => console.error('Failed to fetch register page logo:', e))
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const selectCategory = (id) => setForm({ ...form, business_category_id: id })

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Mohon lengkapi semua field')
      return
    }
    if (form.password.length < 8) {
        setError('Password minimal 8 karakter')
        return
    }
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.business_category_id) {
      setError('Pilih kategori bisnis Anda')
      return
    }
    setError('')
    setLoading(true)
    try {
      const userData = await register(form)
      setSuccess('Akun berhasil dibuat! Membawa Anda masuk...')
      setTimeout(() => {
        if (userData.business_category === 'Toko Retail') {
          navigate('/retail/dashboard')
        } else if (userData.business_category === 'Kuliner') {
          navigate('/kuliner/admin')
        } else if (userData.business_category === 'Budidaya Ikan' || userData.business_category === 'Budidaya Tanaman') {
          navigate('/budidaya/dashboard')
        } else {
          navigate('/coming-soon')
        }
      }, 1500)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join('. '))
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <nav className="topnav">
        <div className="nav-logo">
          <div className="nav-logo-icon" style={{ background: '#fff', padding: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoUrl || bizoraLogo} alt="BIZORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
          </div>
          <span className="nav-logo-name">BIZORA</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Beranda</Link>
          <Link to="/login" className="nav-link">Fitur</Link>
        </div>
        <Link to="/login" className="nav-cta">Masuk Akun</Link>
      </nav>

      <div className="hero">
        <div className="hero-decor hero-decor-1"></div>
        <div className="hero-decor hero-decor-2"></div>
        <div className="hero-inner">
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="hero-badge">
              <i className="ti ti-rocket" aria-hidden="true"></i>
              Gabung Bersama 24.000+ Pelaku Bisnis Lainnya
            </div>
            <h1 className="hero-title">Mulai Transformasi Digital<br /><span>Bisnis Anda Sekarang</span></h1>
            <p className="hero-sub">Daftarkan akun dan nikmati kemudahan mengelola operasional bisnis dengan dashboard modern yang dirancang khusus untuk pelaku bisnis Indonesia.</p>
            
            <div className="hero-stats" style={{ marginTop: '2rem' }}>
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-lbl">Data Aman</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">Gratis</div>
                <div className="hero-stat-lbl">Masa Percobaan</div>
              </div>
            </div>
          </div>

          <div className="login-card" style={{ width: 440 }}>
            <div className="reg-steps">
                <div className={`reg-step ${step >= 1 ? 'reg-step--active' : ''}`}>
                    <div className="reg-step__dot">1</div>
                    <span>Akun</span>
                </div>
                <div className="reg-step__line" />
                <div className={`reg-step ${step >= 2 ? 'reg-step--active' : ''}`}>
                    <div className="reg-step__dot">2</div>
                    <span>Bisnis</span>
                </div>
            </div>

            <div className="login-logo">
              <div className="login-logo-icon"><i className="ti ti-user-plus"></i></div>
              <div>
                <div className="login-logo-text">Daftar Akun</div>
                <div className="login-logo-sub">Lengkapi data untuk memulai</div>
              </div>
            </div>

            {error && <div className="auth-alert auth-alert--error" style={{ marginBottom: 20 }}><span>⚠</span> {error}</div>}
            {success && <div className="auth-alert auth-alert--success" style={{ marginBottom: 20 }}><span>✓</span> {success}</div>}

            {step === 1 ? (
                <form onSubmit={handleNext}>
                    <div className="field-lbl">Nama Pemilik / Bisnis</div>
                    <div className="field-wrap">
                        <i className="ti ti-user field-icon"></i>
                        <input name="name" placeholder="Contoh: Budi Santoso" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="field-lbl">Alamat Email</div>
                    <div className="field-wrap">
                        <i className="ti ti-mail field-icon"></i>
                        <input name="email" type="email" placeholder="email@bisnis.com" value={form.email} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <div className="field-lbl">Kata Sandi</div>
                            <div className="field-wrap">
                                <i className="ti ti-lock field-icon"></i>
                                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                            <div className="field-lbl">Konfirmasi</div>
                            <div className="field-wrap">
                                <i className="ti ti-circle-check field-icon"></i>
                                <input name="password_confirmation" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-login">
                        Lanjut ke Langkah 2 <i className="ti ti-arrow-right"></i>
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="field-lbl">Pilih Kategori Bisnis Anda</div>
                    <div className="category-grid">
                        {categories.map(cat => (
                            <div 
                                key={cat.id} 
                                className={`category-card ${form.business_category_id === cat.id ? 'category-card--selected' : ''}`}
                                onClick={() => selectCategory(cat.id)}
                            >
                                <div className="category-card__icon">
                                    <i className={`ti ${CATEGORY_ICONS[cat.name] || 'ti-building'}`}></i>
                                </div>
                                <div className="category-card__name">{cat.name}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                        <button type="button" className="btn-login" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setStep(1)}>
                            <i className="ti ti-arrow-left"></i>
                        </button>
                        <button type="submit" className="btn-login" disabled={loading || !form.business_category_id}>
                            {loading ? <span className="spinner" style={{ width: 18, height: 18 }}></span> : 'Daftar Sekarang'}
                        </button>
                    </div>
                </form>
            )}

            <div className="login-footer">
              Sudah punya akun? <Link to="/login">Masuk di sini</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
