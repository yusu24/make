import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'
import '../apps/admin/pages/Shared.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

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
    <div className="auth-page">
      {/* Decorative BG */}
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
        <div className="auth-bg__grid" />
      </div>

      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left__content animate-fade-in">
          <div className="auth-left__logo">
            <div className="auth-left__logo-icon">U</div>
            <span className="auth-left__logo-text">UMKM SaaS</span>
          </div>
          <h2 className="auth-left__headline">
            Kelola Bisnis UMKM<br/>
            <span className="gradient-text">Lebih Cerdas & Efisien</span>
          </h2>
          <p className="auth-left__desc">
            Platform terpadu untuk mengelola berbagai kategori bisnis UMKM Indonesia dalam satu dashboard yang powerful.
          </p>
          <div className="auth-left__features">
            {[
              { icon: '◈', text: 'Dashboard analitik real-time' },
              { icon: '⬡', text: 'Multi-tenant & multi-bisnis' },
              { icon: '◉', text: 'Manajemen pengguna terpusat' },
              { icon: '⊞', text: 'Kategori bisnis yang fleksibel' },
            ].map((f, i) => (
              <div key={i} className="auth-left__feature">
                <span className="auth-left__feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <div className="auth-left__stats">
            <div className="auth-left__stat">
              <span className="auth-left__stat-num">500+</span>
              <span className="auth-left__stat-lbl">UMKM Terdaftar</span>
            </div>
            <div className="auth-left__stat">
              <span className="auth-left__stat-num">12+</span>
              <span className="auth-left__stat-lbl">Kategori Bisnis</span>
            </div>
            <div className="auth-left__stat">
              <span className="auth-left__stat-num">99.9%</span>
              <span className="auth-left__stat-lbl">Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <div className="auth-card animate-fade-in">
          <div className="auth-card__header">
            <h1 className="auth-card__title">Selamat Datang 👋</h1>
            <p className="auth-card__sub">Masuk ke akun UMKM SaaS Anda</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert--error">
              <span>⚠</span> {error}
            </div>
          )}

          <form id="form-login" className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-input auth-input"
                  placeholder="nama@bisnis.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input auth-input"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>Memproses...</span>
                </>
              ) : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Belum punya akun?{' '}
              <Link id="link-to-register" to="/register" className="auth-link">
                Daftar sekarang →
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="auth-demo">
            <p className="auth-demo__title">🔑 Demo Credentials</p>
            <div className="auth-demo__items">
              <div className="auth-demo__item">
                <span className="badge badge-violet">Super Admin</span>
                <code>admin@umkm.com / password</code>
              </div>
              <div className="auth-demo__item">
                <span className="badge badge-green">Customer</span>
                <code>customer@umkm.com / password</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
