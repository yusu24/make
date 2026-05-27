import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './Auth.css'

export default function Landing() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [demoLoading, setDemoLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const [submitForm, setSubmitForm] = useState({ name: '', role: '', stars: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [settings, setSettings] = useState({
    hero_title: 'Kelola Bisnis UMKM',
    hero_subtitle: 'Lebih Cerdas & Mudah',
    hero_desc: 'Satu platform untuk retail, budidaya ikan, kuliner, dan jasa. Kelola stok, pesanan, laporan keuangan, dan pelanggan dalam satu genggaman.',
    campaign_text: 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat UMKM Anda naik tingkat. Hubungi admin untuk mendapatkan promo menarik per kategori bisnis Anda.',
    campaign_active: true,
    show_sandbox: true,
    show_features: true,
    show_testimonials: true,
  })

  // Redirect to dashboard instantly if user is already authenticated
  if (user) {
    if (user.role === 'super_admin') return <Navigate to="/dashboard" replace />
    if (user.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />
    if (user.business_category === 'Budidaya Ikan') return <Navigate to="/budidaya/dashboard" replace />
    if (user.business_category === 'Kuliner') return <Navigate to="/kuliner/admin" replace />
    return <Navigate to="/coming-soon" replace />
  }

  const [categories, setCategories] = useState([])

  // Load dynamic landing page settings and active public testimonials
  useEffect(() => {
    api.get('/landing-settings')
      .then(r => {
        if (r.data?.data) {
          setSettings(r.data.data)
        }
      })
      .catch(e => console.error('Gagal mengambil pengaturan landing:', e))

    api.get('/categories/public')
      .then(r => {
        if (r.data?.data) {
          setCategories(r.data.data)
        }
      })
      .catch(e => console.error('Gagal mengambil kategori:', e))

    api.get('/testimonials/public')
      .then(r => {
        if (r.data?.data) {
          setTestimonials(r.data.data)
        }
      })
      .catch(e => console.error('Gagal mengambil testimoni publik:', e))
      .finally(() => setTestimonialsLoading(false))
  }, [])

  // Smooth scroll for nav links
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDemoLogin = async (category) => {
    setDemoLoading(true)
    try {
      let email = 'ahmad@retail.com'
      let path = '/retail/dashboard'
      
      if (category === 'budidaya' || category === 'budidaya-ikan') {
        email = 'siti@ikan.com'
        path = '/budidaya/dashboard'
      } else if (category === 'kuliner') {
        email = 'dewi@kuliner.com'
        path = '/kuliner/admin'
      } else if (category === 'jasa') {
        alert('Modul Jasa segera hadir!');
        setDemoLoading(false);
        return;
      }
      
      await login(email, 'password')
      navigate(path)
    } catch (err) {
      alert('Gagal memproses demo sandbox: ' + (err.response?.data?.message || 'Koneksi bermasalah'))
    } finally {
      setDemoLoading(false)
    }
  }

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault()
    if (!submitForm.name.trim() || !submitForm.role.trim() || !submitForm.text.trim()) return
    setSubmitting(true)
    try {
      await api.post('/testimonials/public-submit', submitForm)
      setSubmitSuccess(true)
      setSubmitForm({ name: '', role: '', stars: 5, text: '' })
    } catch (err) {
      alert('Gagal mengirim ulasan: ' + (err.response?.data?.message || 'Masalah koneksi internet'))
    } finally {
      setSubmitting(false)
    }
  }

  const nextSlide = () => {
    if (slideIndex < testimonials.length - 3) {
      setSlideIndex(slideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1)
    }
  }

  const features = categories
    .filter(c => settings.featured_categories ? settings.featured_categories.includes(c.slug) : true)
    .map(c => ({
      id: c.slug,
      category: c.slug,
      name: c.name,
      desc: c.description,
      icon: c.icon || '📦',
      color: c.color || '#3b82f6',
      pills: c.features_list && c.features_list.length > 0 
        ? c.features_list 
        : c.promo_active ? [`Promo ${c.discount_pct}% OFF`, c.promo_text].filter(Boolean) : ['Fitur Premium']
    }))

  const filteredFeatures = activeTab === 'all' ? features : features.filter(f => f.category === activeTab)

  return (
    <div className="page">
      <h2 className="sr-only">UMKM Hub — halaman utama, login, dan fitur platform digital UMKM Indonesia</h2>

      {/* NAV */}
      <nav className="topnav">
        <div className="nav-logo">
          <div className="nav-logo-icon"><i className="ti ti-building-store" aria-hidden="true"></i></div>
          <span className="nav-logo-name">UMKM Hub</span>
        </div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Beranda</span>
          <span className="nav-link" onClick={() => scrollTo('fitur')}>Fitur</span>
          <span className="nav-link" onClick={() => scrollTo('how-it-works')}>Cara Kerja</span>
          <span className="nav-link" onClick={() => scrollTo('testimoni')}>Testimoni</span>
        </div>
        {user ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/dashboard" className="nav-cta" style={{ background: 'var(--primary-500)' }}>Ke Dashboard</Link>
            <button onClick={() => { logout(); navigate('/') }} className="btn btn-ghost" style={{ padding: '8px 16px', color: '#fff' }}>Keluar</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login" style={{ color: '#fff', padding: '10px 20px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>Masuk</Link>
            <Link to="/register" className="nav-cta">Daftar Gratis</Link>
          </div>
        )}
      </nav>

      {/* HERO + DEMO SANDBOX */}
      <div className="hero">
        <div className="hero-decor hero-decor-1"></div>
        <div className="hero-decor hero-decor-2"></div>
        <div className="hero-inner">
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="hero-badge">
              <i className="ti ti-sparkles" aria-hidden="true"></i>
              Platform UMKM Terpadu #1 Indonesia
            </div>
            <h1 className="hero-title">{settings.hero_title}<br /><span>{settings.hero_subtitle}</span></h1>
            <p className="hero-sub">{settings.hero_desc}</p>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">24K+</div>
                <div className="hero-stat-lbl">UMKM Aktif</div>
              </div>
              <div>
                <div className="hero-stat-num">98%</div>
                <div className="hero-stat-lbl">Kepuasan Pengguna</div>
              </div>
              <div>
                <div className="hero-stat-num">Rp 4,2M</div>
                <div className="hero-stat-lbl">Omzet Dikelola</div>
              </div>
            </div>
          </div>

          {/* SANDBOX PANEL CARD CONDITIONAL */}
          {settings.show_sandbox ? (
            <div className="login-card" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 32, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', minWidth: 320 }}>
              <div className="login-logo">
                <div className="login-logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}><i className="ti ti-device-laptop" aria-hidden="true"></i></div>
                <div>
                  <div className="login-logo-text" style={{ background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sandbox Instan</div>
                  <div className="login-logo-sub">Coba Sistem Kategori Aktif</div>
                </div>
              </div>
              
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Klik tombol uji coba di bawah untuk langsung masuk dan mengevaluasi modul aktif platform kami tanpa perlu mendaftar terlebih dahulu!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button 
                  onClick={() => handleDemoLogin('retail')} 
                  disabled={demoLoading}
                  className="btn-demo" 
                  style={{ 
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                    color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 8, 
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', 
                    gap: 12, fontSize: 13, transition: 'all 0.3s ease', textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>🛒</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>Demo Toko Retail</div>
                    <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>Sistem POS Kasir & Stok Barang</div>
                  </div>
                  <span>→</span>
                </button>

                <button 
                  onClick={() => handleDemoLogin('budidaya')} 
                  disabled={demoLoading}
                  className="btn-demo" 
                  style={{ 
                    background: 'linear-gradient(135deg, #10b981, #047857)', 
                    color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 8, 
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', 
                    gap: 12, fontSize: 13, transition: 'all 0.3s ease', textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>🐟</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>Demo Budidaya Ikan</div>
                    <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>Monitoring Siklus, Kolam & Pakan</div>
                  </div>
                  <span>→</span>
                </button>

                <button 
                  onClick={() => handleDemoLogin('kuliner')} 
                  disabled={demoLoading}
                  className="btn-demo" 
                  style={{ 
                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                    color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 8, 
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', 
                    gap: 12, fontSize: 13, transition: 'all 0.3s ease', textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>🍱</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>Demo Kuliner Restoran</div>
                    <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>Website Order & Daftar Menu</div>
                  </div>
                  <span>→</span>
                </button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                <span>🔒 Sandbox aman & terenkripsi</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 0.8, minWidth: 260, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ padding: '40px 30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, textAlign: 'center', backdropFilter: 'blur(10px)', maxWidth: 360 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: 18, fontWeight: 800 }}>Keandalan Berkelas Dunia</h4>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>Multi-tenant SaaS andal dengan tingkat SLA 99.9% untuk mendigitalisasi usaha Anda secara instan.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAMPAIGN STRIP CONDITIONAL */}
      {settings.campaign_active && (
        <div className="campaign-strip">
          <div className="campaign-text">
            <strong>{settings.campaign_text}</strong>
          </div>
          <div className="campaign-btns">
            <button className="campaign-btn-primary" onClick={() => scrollTo('fitur')}>Mulai Test Kategori ↗</button>
          </div>
        </div>
      )}

      {/* FITUR SECTION CONDITIONAL */}
      {settings.show_features && (
        <div className="section" id="fitur">
          <div className="section-header">
            <div className="section-tag">Fitur Unggulan</div>
            <h2 className="section-title">Semua yang dibutuhkan bisnis Anda</h2>
            <p className="section-desc">Dirancang khusus untuk 4 sektor UMKM utama di Indonesia — dari pencatatan sederhana hingga analitik bisnis tingkat lanjut.</p>
          </div>

          <div className="tabs">
            {['all', ...features.map(f => f.category)].map(tab => {
              const catObj = features.find(f => f.category === tab);
              return (
                <button 
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? 'Semua' : catObj ? catObj.name : tab}
                </button>
              );
            })}
          </div>

          <div className="features-grid">
            {filteredFeatures.map(feat => (
              <div key={feat.id} className={`feat-card ${feat.category}`} style={{ cursor: 'pointer' }} onClick={() => handleDemoLogin(feat.category)}>
                <div className="feat-icon-bg" style={{ background: `${feat.color}20`, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {feat.icon}
                </div>
                <div className="feat-name">{feat.name}</div>
                <div className="feat-desc">{feat.desc}</div>
                <div className="feat-pills">
                  {feat.pills.map(pill => <span key={pill} className="feat-pill">{pill}</span>)}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--primary-500)' }}>
                  <span>⚡ Uji Coba Modul Ini</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <div className="section section-alt" id="how-it-works">
        <div className="section-header">
          <div className="section-tag">Cara Kerja</div>
          <h2 className="section-title">Mulai dalam 3 langkah mudah</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <div className="step-title">Daftar akun</div>
            <div className="step-desc">Buat akun gratis dalam 2 menit. Tidak butuh kartu kredit.</div>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <div className="step-title">Pilih jenis usaha</div>
            <div className="step-desc">Sistem menyesuaikan fitur sesuai sektor UMKM Anda secara otomatis.</div>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <div className="step-title">Kelola bisnis</div>
            <div className="step-desc">Mulai catat transaksi, stok, dan laporan langsung dari dashboard Anda.</div>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <div className="step-title">Kembangkan usaha</div>
            <div className="step-desc">Gunakan analitik AI untuk menemukan peluang pertumbuhan bisnis Anda.</div>
          </div>
        </div>
      </div>

      {/* TESTIMONIAL CONDITIONAL */}
      {settings.show_testimonials && (
        <div className="section" id="testimoni">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: '2.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div className="section-tag">Testimoni</div>
              <h2 className="section-title" style={{ margin: 0 }}>Dipercaya ribuan UMKM Indonesia</h2>
            </div>
            
            {/* Slider Navigation Arrows */}
            {!testimonialsLoading && testimonials.length > 3 && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  type="button"
                  onClick={prevSlide}
                  disabled={slideIndex === 0}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                    background: slideIndex === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
                    color: slideIndex === 0 ? 'rgba(255,255,255,0.25)' : '#fff', cursor: slideIndex === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 'bold',
                    transition: 'all 0.2s', outline: 'none'
                  }}
                >
                  ←
                </button>
                <button 
                  type="button"
                  onClick={nextSlide}
                  disabled={slideIndex >= testimonials.length - 3}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                    background: slideIndex >= testimonials.length - 3 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
                    color: slideIndex >= testimonials.length - 3 ? 'rgba(255,255,255,0.25)' : '#fff', cursor: slideIndex >= testimonials.length - 3 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 'bold',
                    transition: 'all 0.2s', outline: 'none'
                  }}
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="testi-grid" style={{ marginBottom: '3.5rem' }}>
            {testimonialsLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                Memuat ulasan...
              </div>
            ) : testimonials.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                Belum ada ulasan aktif yang dipublikasikan.
              </div>
            ) : (
              testimonials.slice(slideIndex, slideIndex + 3).map(testi => (
                <div key={testi.id} className="testi-card" style={{ animation: 'fadeIn 0.4s ease' }}>
                  <div className="testi-stars" style={{ color: '#fbbf24', fontSize: 14, marginBottom: 8 }}>
                    {'★'.repeat(testi.stars)}{'☆'.repeat(5 - testi.stars)}
                  </div>
                  <div className="testi-text">"{testi.text}"</div>
                  <div className="testi-author">
                    <div className="testi-avatar" style={{ background: testi.avatar_bg || '#e2e8f0', color: testi.avatar_color || '#475569', fontWeight: 800 }}>
                      {testi.avatar_text || '??'}
                    </div>
                    <div>
                      <div className="testi-name" style={{ color: '#fff', fontSize: 13 }}>{testi.name}</div>
                      <div className="testi-role" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{testi.role}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* NEW WORKFLOW: CUSTOMER FEEDBACK SUBMISSION WIDGET (HIGH CONTRAST WHITE CONTAINER) */}
          <div style={{
            marginTop: '3.5rem',
            background: '#ffffff',
            border: 'none',
            borderRadius: 24,
            padding: '36px 44px',
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
            color: '#1e293b',
            fontFamily: 'Outfit, sans-serif'
          }}>
            <h3 style={{ fontSize: 22, color: '#0f6e56', fontWeight: 900, textAlign: 'center', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span>✍️</span> Bagikan Cerita Sukses Anda
            </h3>
            <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 28, lineHeight: 1.6, fontWeight: 500 }}>
              Punya pengalaman menyenangkan menggunakan UMKM Hub? Bagikan cerita Anda sekarang! Ulasan Anda akan ditinjau oleh Admin sebelum ditayangkan.
            </p>

            {submitSuccess ? (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '18px 24px',
                borderRadius: 16,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.7,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
              }}>
                🎉 Terima kasih banyak! Ulasan Anda telah berhasil dikirim ke Admin untuk ditinjau terlebih dahulu. Cerita sukses Anda sangat berharga bagi komunitas UMKM Indonesia! 🙏
              </div>
            ) : (
              <form onSubmit={handleSubmitTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAMA LENGKAP</label>
                    <input 
                      type="text"
                      required
                      placeholder="Contoh: Ahmad Apoteker"
                      value={submitForm.name}
                      onChange={e => setSubmitForm({...submitForm, name: e.target.value})}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1',
                        background: '#f8fafc', color: '#1e293b', fontSize: 13, outline: 'none', fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>JENIS USAHA & KOTA</label>
                    <input 
                      type="text"
                      required
                      placeholder="Contoh: Pemilik Apotek, Jakarta"
                      value={submitForm.role}
                      onChange={e => setSubmitForm({...submitForm, role: e.target.value})}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1',
                        background: '#f8fafc', color: '#1e293b', fontSize: 13, outline: 'none', fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RATING BINTANG</label>
                  <div style={{ display: 'flex', gap: 8, fontSize: 28, cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star}
                        onClick={() => setSubmitForm({...submitForm, stars: star})}
                        style={{ color: star <= submitForm.stars ? '#fbbf24' : '#e2e8f0', transition: 'color 0.1s ease' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>KUTIPAN PENGALAMAN / REVIEW</label>
                  <textarea 
                    required
                    rows="4"
                    placeholder="Tulis ulasan jujur atau cerita sukses Anda menggunakan platform kami..."
                    value={submitForm.text}
                    onChange={e => setSubmitForm({...submitForm, text: e.target.value})}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #cbd5e1',
                      background: '#f8fafc', color: '#1e293b', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 10,
                    fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    marginTop: 6
                  }}
                >
                  {submitting ? 'Mengirim Ulasan...' : '🚀 Kirim Cerita Sukses Anda'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FINAL CTA CAMPAIGN */}
      <div style={{ background: '#1D9E75', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Siap digitalisasi bisnis Anda?</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: '2.5rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>Bergabunglah bersama 24.000+ UMKM yang sudah merasakan manfaatnya. Gratis selamanya untuk fitur dasar.</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" style={{ padding: '12px 32px', background: '#fff', color: '#0F6E56', border: 'none', borderRadius: '8px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Masuk Ke Dashboard ↗</Link>
          ) : (
            <>
              <Link to="/register" style={{ padding: '12px 32px', background: '#fff', color: '#0F6E56', border: 'none', borderRadius: '8px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Daftar Gratis Sekarang ↗</Link>
              <Link to="/login" style={{ padding: '12px 32px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Masuk Login</Link>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-brand">
          <strong>UMKM Hub</strong>
          © 2026 UMKM Hub Indonesia. Semua hak dilindungi.
        </div>
        <div className="footer-links">
          <span className="footer-link">Kebijakan Privasi</span>
          <span className="footer-link">Syarat & Ketentuan</span>
          <span className="footer-link">Bantuan</span>
          <span className="footer-link">Kontak</span>
        </div>
      </div>

    </div>
  )
}
