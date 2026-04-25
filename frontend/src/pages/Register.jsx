import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './Auth.css'
import './Register.css'
import '../apps/admin/pages/Shared.css'

const CATEGORY_ICONS = {
  'Budidaya Ikan': '🐟',
  'Toko Retail':   '🛒',
  'Jasa':          '🔧',
  'Manufaktur':    '🏭',
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

  useEffect(() => {
    api.get('/categories/public').then(res => {
      setCategories(res.data?.data || [])
    }).catch(() => {
      // Fallback demo categories
      setCategories([
        { id: 1, name: 'Budidaya Ikan' },
        { id: 2, name: 'Toko Retail' },
        { id: 3, name: 'Jasa' },
        { id: 4, name: 'Manufaktur' },
      ])
    })
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const selectCategory = (id) => setForm({ ...form, business_category_id: id })

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Mohon lengkapi semua field')
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
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
        <div className="auth-bg__grid" />
      </div>

      <div className="auth-left">
        <div className="auth-left__content animate-fade-in">
          <div className="auth-left__logo">
            <div className="auth-left__logo-icon">U</div>
            <span className="auth-left__logo-text">UMKM SaaS</span>
          </div>
          <h2 className="auth-left__headline">
            Bergabung dengan<br/>
            <span className="gradient-text">Ribuan UMKM</span>
          </h2>
          <p className="auth-left__desc">
            Daftarkan bisnis Anda dan mulai kelola operasional dengan dashboard yang modern dan lengkap.
          </p>
          <div className="auth-left__features">
            {[
              { icon: '🚀', text: 'Setup cepat, langsung siap pakai' },
              { icon: '📊', text: 'Laporan bisnis komprehensif' },
              { icon: '🔐', text: 'Keamanan data terjamin' },
              { icon: '💬', text: 'Dukungan teknis 24/7' },
            ].map((f, i) => (
              <div key={i} className="auth-left__feature">
                <span className="auth-left__feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right" style={{ width: 520 }}>
        <div className="auth-card" style={{ maxWidth: 440 }}>
          {/* Step indicator */}
          <div className="reg-steps">
            <div className={`reg-step ${step >= 1 ? 'reg-step--active' : ''}`}>
              <div className="reg-step__dot">1</div>
              <span>Informasi Akun</span>
            </div>
            <div className="reg-step__line" />
            <div className={`reg-step ${step >= 2 ? 'reg-step--active' : ''}`}>
              <div className="reg-step__dot">2</div>
              <span>Pilih Kategori</span>
            </div>
          </div>

          <div className="auth-card__header">
            <h1 className="auth-card__title">
              {step === 1 ? 'Buat Akun 🚀' : 'Pilih Bisnis Anda'}
            </h1>
            <p className="auth-card__sub">
              {step === 1 ? 'Lengkapi data diri untuk mendaftar' : 'Pilih kategori bisnis yang sesuai'}
            </p>
          </div>

          {error && <div className="auth-alert auth-alert--error"><span>⚠</span> {error}</div>}
          {success && <div className="auth-alert auth-alert--success"><span>✓</span> {success}</div>}

          {step === 1 ? (
            <form id="form-register-step1" className="auth-form" onSubmit={handleNext} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Nama Lengkap</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input id="reg-name" name="name" type="text" className="form-input auth-input"
                    placeholder="Nama bisnis / pemilik" value={form.name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉</span>
                  <input id="reg-email" name="email" type="email" className="form-input auth-input"
                    placeholder="email@bisnis.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="auth-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-pass">Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔒</span>
                    <input id="reg-pass" name="password" type="password" className="form-input auth-input"
                      placeholder="Min. 8 karakter" value={form.password} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-pass-confirm">Konfirmasi</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔐</span>
                    <input id="reg-pass-confirm" name="password_confirmation" type="password" className="form-input auth-input"
                      placeholder="Ulangi password" value={form.password_confirmation} onChange={handleChange} required />
                  </div>
                </div>
              </div>
              <button id="btn-next-step" type="submit" className="btn btn-primary btn-full btn-lg">
                Lanjut →
              </button>
            </form>
          ) : (
            <form id="form-register-step2" className="auth-form" onSubmit={handleSubmit}>
              <div className="category-grid">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    id={`btn-cat-${cat.id}`}
                    className={`category-card ${form.business_category_id === cat.id ? 'category-card--selected' : ''}`}
                    onClick={() => selectCategory(cat.id)}
                  >
                    <span className="category-card__icon">
                      {CATEGORY_ICONS[cat.name] || '🏢'}
                    </span>
                    <span className="category-card__name">{cat.name}</span>
                    {form.business_category_id === cat.id && (
                      <span className="category-card__check">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="auth-grid-2">
                <button id="btn-back-step" type="button" className="btn btn-secondary btn-lg"
                  onClick={() => setStep(1)}>← Kembali</button>
                <button id="btn-register-submit" type="submit" className="btn btn-primary btn-lg"
                  disabled={loading || !form.business_category_id}>
                  {loading ? (
                    <><span className="spinner" style={{width:18,height:18,borderWidth:2}}/> Mendaftar...</>
                  ) : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            <p>Sudah punya akun?{' '}
              <Link id="link-to-login" to="/login" className="auth-link">Masuk di sini →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
