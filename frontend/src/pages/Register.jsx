import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './Auth.css'
import bizoraLogo from '../assets/bizora-logo.png'
import { 
  User, Mail, Lock, CheckCircle2, ArrowRight, ArrowLeft, 
  UserPlus, Rocket, Eye, EyeOff, Store, Utensils, 
  Fish, Sprout, Wrench, Package, Factory, Briefcase, Building,
  KeyRound, RefreshCw, ShieldCheck
} from 'lucide-react'

const CATEGORY_META_ICONS = {
  'Budidaya Tanaman':   Sprout,
  'Toko Retail':        Store,
  'Budidaya Hewan':     Fish,
  'Jasa':               Briefcase,
  'Jasa & Repair':      Wrench,
  'Kuliner':            Utensils,
  'Seller':             Package,
  'Seller Marketplace': Package,
  'Manufaktur':         Factory,
}

export default function Register() {
  const { register, verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    business_category_id: ''
  })
  const [otpCode, setOtpCode] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    const verifyEmailParam = searchParams.get('verify_email')
    if (verifyEmailParam) {
      setForm(prev => ({ ...prev, email: verifyEmailParam }))
      setStep(3)
      setCanResend(false)
      setResendTimer(60)
    }

    api.get('/categories/public').then(res => {
      setCategories(res.data?.data || [])
    }).catch(() => {
      setCategories([
        { id: 1, name: 'Toko Retail', icon: '🛒' },
        { id: 2, name: 'Kuliner', icon: '🍽️' },
        { id: 3, name: 'Budidaya Hewan', icon: '🐟' },
        { id: 4, name: 'Budidaya Tanaman', icon: '🌱' },
        { id: 5, name: 'Jasa & Repair', icon: '🛠️' },
        { id: 6, name: 'Seller Marketplace', icon: '📦' },
      ])
    })

    api.get('/landing-settings').then(res => {
      if (res.data?.data?.landing_logo_url) {
        setLogoUrl(res.data.data.landing_logo_url)
      }
    }).catch(e => console.error('Failed to fetch register page logo:', e))
  }, [searchParams])

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval = null
    if (step === 3 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, resendTimer])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const selectCategory = (id) => setForm({ ...form, business_category_id: id })

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    // Strict Email Format Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(form.email.trim())) {
      setError('Format email tidak valid! Pastikan mengandung @ dan nama domain yang benar (contoh: budi@gmail.com)')
      return
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter demi keamanan akun Anda')
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.business_category_id) {
      setError('Silakan pilih salah satu kategori bisnis Anda')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await register(form)
      setSuccess(res.message || 'Kode OTP verifikasi telah dikirim ke email Anda.')
      setStep(3)
      setResendTimer(60)
      setCanResend(false)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join('. '))
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal. Silakan periksa kembali data Anda.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length < 6) {
      setError('Masukkan 6 digit kode OTP yang telah dikirim ke email Anda')
      return
    }
    setError('')
    setLoading(true)
    try {
      const userData = await verifyOtp(form.email, otpCode.trim())
      setSuccess('Verifikasi berhasil! Mengarahkan ke dashboard...')
      setTimeout(() => {
        if (userData.role === 'super_admin' || userData.role === 'admin') {
          navigate('/dashboard')
        } else if (userData.business_category === 'Toko Retail') {
          navigate('/retail/dashboard')
        } else if (userData.business_category === 'Kuliner') {
          navigate('/kuliner/admin')
        } else if (userData.business_category === 'Budidaya Hewan' || userData.business_category === 'Budidaya Tanaman') {
          navigate('/budidaya/dashboard')
        } else if (userData.business_category === 'Seller') {
          navigate('/seller/dashboard')
        } else if (userData.business_category === 'Jasa') {
          navigate('/jasa/dashboard')
        } else {
          navigate('/coming-soon')
        }
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid atau telah kedaluwarsa')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend || resending) return
    setError('')
    setResending(true)
    try {
      const res = await resendOtp(form.email)
      setSuccess(res.message || 'Kode OTP baru berhasil dikirim ulang ke email Anda.')
      setResendTimer(60)
      setCanResend(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang kode OTP')
    } finally {
      setResending(false)
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
          <Link to="/" className="nav-link">Beranda</Link>
          <Link to="/#fitur" className="nav-link">Fitur</Link>
        </div>
        <Link to="/login" className="nav-cta">Masuk Akun</Link>
      </nav>

      <div className="hero">
        <div className="hero-decor hero-decor-1"></div>
        <div className="hero-decor hero-decor-2"></div>
        <div className="hero-inner">
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Rocket size={16} className="text-amber-400" />
              <span>Gabung Bersama 24.000+ Pelaku Bisnis Lainnya</span>
            </div>
            <h1 className="hero-title">Mulai Transformasi Digital<br /><span>Bisnis Anda Sekarang</span></h1>
            <p className="hero-sub">Daftarkan akun dan nikmati kemudahan mengelola operasional bisnis dengan dashboard modern yang dirancang khusus untuk pelaku bisnis Indonesia.</p>
            
            <div className="hero-stats" style={{ marginTop: '2rem' }}>
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-lbl">Data Aman &amp; Terisolasi</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">Gratis</div>
                <div className="hero-stat-lbl">Masa Percobaan Langsung Aktif</div>
              </div>
            </div>
          </div>

          <div className="login-card">
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
                <div className="reg-step__line" />
                <div className={`reg-step ${step >= 3 ? 'reg-step--active' : ''}`}>
                    <div className="reg-step__dot">3</div>
                    <span>Verifikasi</span>
                </div>
            </div>

            <div className="login-logo">
              <div className="login-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: step === 3 ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)', color: step === 3 ? '#3b82f6' : '#10b981' }}>
                {step === 3 ? <ShieldCheck size={22} /> : <UserPlus size={22} />}
              </div>
              <div>
                <div className="login-logo-text">
                  {step === 3 ? 'Verifikasi Email Anda' : 'Daftar Akun Baru'}
                </div>
                <div className="login-logo-sub">
                  {step === 3 ? 'Masukkan kode OTP 6 digit yang kami kirim' : 'Lengkapi data untuk memulai sistem bisnis'}
                </div>
              </div>
            </div>

            {error && <div className="auth-alert auth-alert--error" style={{ marginBottom: 20 }}><span>⚠</span> {error}</div>}
            {success && <div className="auth-alert auth-alert--success" style={{ marginBottom: 20 }}><span>✓</span> {success}</div>}

            {step === 1 && (
                <form onSubmit={handleNext}>
                    <div className="field-lbl">Nama Pemilik / Bisnis</div>
                    <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <User size={18} className="field-icon opacity-60 shrink-0" />
                        <input name="name" placeholder="Contoh: Budi Santoso" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="field-lbl">Alamat Email</div>
                    <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Mail size={18} className="field-icon opacity-60 shrink-0" />
                        <input name="email" type="email" placeholder="email@bisnis.com" value={form.email} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <div className="field-lbl">Kata Sandi</div>
                            <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 10 }}>
                                <Lock size={16} className="field-icon opacity-60 shrink-0" />
                                <input 
                                  name="password" 
                                  type={showPass ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  value={form.password} 
                                  onChange={handleChange} 
                                  required 
                                  style={{ flex: 1 }}
                                />
                                <button 
                                  type="button" 
                                  onClick={() => setShowPass(!showPass)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                                >
                                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="field-lbl">Konfirmasi Sandi</div>
                            <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <CheckCircle2 size={16} className="field-icon opacity-60 shrink-0" />
                                <input 
                                  name="password_confirmation" 
                                  type={showPass ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  value={form.password_confirmation} 
                                  onChange={handleChange} 
                                  required 
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span>Lanjut ke Langkah 2</span>
                        <ArrowRight size={16} />
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit}>
                    <div className="field-lbl">Pilih Kategori Bisnis Anda</div>
                    <div className="category-grid">
                        {categories.map(cat => {
                            const IconComp = CATEGORY_META_ICONS[cat.name] || Building;
                            return (
                                <div 
                                    key={cat.id} 
                                    className={`category-card ${form.business_category_id === cat.id ? 'category-card--selected' : ''}`}
                                    onClick={() => selectCategory(cat.id)}
                                >
                                    <div className="category-card__icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {cat.icon && (cat.icon.length <= 4 || !cat.icon.startsWith('ti-')) ? (
                                          <span style={{ fontSize: 24 }}>{cat.icon}</span>
                                        ) : (
                                          <IconComp size={24} />
                                        )}
                                    </div>
                                    <div className="category-card__name">{cat.name}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                        <button type="button" className="btn-login" style={{ background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setStep(1)} title="Kembali ke Langkah 1">
                            <ArrowLeft size={18} />
                        </button>
                        <button type="submit" className="btn-login" disabled={loading || !form.business_category_id}>
                            {loading ? <span className="spinner" style={{ width: 18, height: 18 }}></span> : 'Daftar & Kirim OTP'}
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', padding: '14px 16px', borderRadius: 12, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      Kode verifikasi 6 digit telah dikirimkan ke email: <br />
                      <strong style={{ color: '#1e293b', fontSize: 14 }}>{form.email}</strong>
                    </div>

                    <div>
                      <div className="field-lbl">Masukkan Kode OTP 6-Digit</div>
                      <div className="field-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <KeyRound size={20} className="field-icon opacity-60 shrink-0" />
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          style={{
                            letterSpacing: '8px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontFamily: 'monospace'
                          }}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-login" 
                      disabled={loading || otpCode.length < 6}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44 }}
                    >
                      {loading ? (
                        <span className="spinner" style={{ width: 18, height: 18 }}></span>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Verifikasi &amp; Masuk Dashboard</span>
                        </>
                      )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, paddingTop: 4 }}>
                      <button 
                        type="button" 
                        onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        ← Ubah Data / Email
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || resending}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: canResend ? '#3b82f6' : '#94a3b8',
                          fontWeight: 600,
                          cursor: canResend ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: 0
                        }}
                      >
                        <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                        <span>{canResend ? 'Kirim Ulang Kode' : `Kirim Ulang (${resendTimer}s)`}</span>
                      </button>
                    </div>
                </form>
            )}

            <div className="login-footer">
              Sudah punya akun? <Link to="/login" style={{ color: '#10b981', fontWeight: 600 }}>Masuk di sini</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
