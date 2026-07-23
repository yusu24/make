import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import {
  Sparkles, ArrowRight, ArrowUpRight, ShieldCheck, ChevronLeft, ChevronRight,
  UserPlus, ListChecks, LayoutDashboard, TrendingUp, Zap, Timer, Gift, MonitorSmartphone,
} from 'lucide-react'
import './Auth.css'
import './Landing.css'
import bizoraLogo from '../assets/bizora-logo.png'

// Visual config per slug — sandbox panel appearance
const SLUG_VISUALS = {
  'toko-retail':      { emoji: '🛒', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', sub: 'Sistem POS Kasir & Stok Barang' },
  'budidaya-ikan':    { emoji: '🐟', bg: 'linear-gradient(135deg,#10b981,#047857)', sub: 'Monitoring Siklus, Kolam & Pakan' },
  'budidaya-tanaman': { emoji: '🌱', bg: 'linear-gradient(135deg,#84cc16,#4d7c0f)', sub: 'Monitoring Siklus, Lahan & Pupuk' },
  'kuliner':          { emoji: '🍱', bg: 'linear-gradient(135deg,#ef4444,#b91c1c)', sub: 'Menu Digital & Manajemen Restoran' },
}

// Route map per slug — where to navigate after demo login
const SLUG_ROUTES = {
  'toko-retail':      '/retail/dashboard',
  'budidaya-ikan':    '/budidaya/dashboard',
  'budidaya-tanaman': '/budidaya/dashboard',
  'kuliner':          '/kuliner/admin',
}

const STEPS = [
  { icon: UserPlus, title: 'Daftar akun', desc: 'Buat akun gratis dalam 2 menit. Tidak butuh kartu kredit.' },
  { icon: ListChecks, title: 'Pilih jenis usaha', desc: 'Sistem menyesuaikan fitur sesuai sektor bisnis Anda secara otomatis.' },
  { icon: LayoutDashboard, title: 'Kelola bisnis', desc: 'Mulai catat transaksi, stok, dan laporan langsung dari dashboard Anda.' },
  { icon: TrendingUp, title: 'Kembangkan usaha', desc: 'Gunakan analitik untuk menemukan peluang pertumbuhan bisnis Anda.' },
]

export default function Landing() {
  const { user, login, loginDemoSandbox, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('all')
  const [demoLoading, setDemoLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)
  const testiTrackRef = useRef(null)
  const [submitForm, setSubmitForm] = useState({ name: '', role: '', stars: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [settings, setSettings] = useState({
    hero_title: 'Kelola Bisnis Anda',
    hero_subtitle: 'Lebih Cerdas & Mudah',
    hero_desc: 'Satu platform untuk retail, budidaya ikan, kuliner, dan jasa. Kelola stok, pesanan, laporan keuangan, dan pelanggan dalam satu genggaman.',
    campaign_text: 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat bisnis Anda naik tingkat. Hubungi admin untuk mendapatkan promo menarik per kategori bisnis Anda.',
    campaign_active: true,
    show_sandbox: true,
    show_features: true,
    show_testimonials: true,
  })

  // Redirect to dashboard instantly if user is already authenticated
  if (user) {
    if (user.role === 'super_admin') return <Navigate to="/dashboard" replace />
    if (user.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />
    if (user.business_category === 'Budidaya Ikan' || user.business_category === 'Budidaya Tanaman') return <Navigate to="/budidaya/dashboard" replace />
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

  // Scroll to the section named in the URL hash (e.g. coming from /register's "Fitur" link)
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  // Smooth scroll for nav links
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDemoLogin = async (slug) => {
    setDemoLoading(true)
    try {
      const path = SLUG_ROUTES[slug]
      if (!path) {
        alert('Modul ini segera hadir! 🚀')
        setDemoLoading(false)
        return
      }
      await loginDemoSandbox(slug)
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

  const scrollTesti = (dir) => {
    const el = testiTrackRef.current
    if (!el) return
    const card = el.querySelector('.lp-testi-card')
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const nextSlide = () => scrollTesti(1)
  const prevSlide = () => scrollTesti(-1)

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
    <div className="lp-root">
      <h2 className="sr-only">BIZORA — halaman utama, login, dan fitur platform digital bisnis Indonesia</h2>

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <div className="lp-nav-logo-icon">
            <img src={settings.landing_logo_url || bizoraLogo} alt="BIZORA Logo" />
          </div>
          <span className="lp-nav-logo-name">BIZORA</span>
        </div>
        <div className="lp-nav-links">
          <span className="lp-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Beranda</span>
          <span className="lp-nav-link" onClick={() => scrollTo('fitur')}>Fitur</span>
          <span className="lp-nav-link" onClick={() => scrollTo('how-it-works')}>Cara Kerja</span>
          <span className="lp-nav-link" onClick={() => scrollTo('testimoni')}>Testimoni</span>
        </div>
        {user ? (
          <div className="lp-nav-actions">
            <Link to="/dashboard" className="lp-nav-cta">Ke Dashboard</Link>
            <button onClick={() => { logout(); navigate('/') }} className="lp-nav-ghost-btn">Keluar</button>
          </div>
        ) : (
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-nav-signin">Masuk</Link>
            <Link to="/register" className="lp-nav-cta">Daftar Gratis</Link>
          </div>
        )}
      </nav>

      {/* HERO + DEMO SANDBOX */}
      <div className="lp-hero">
        <div className="lp-hero-noise" />
        <div className="lp-hero-inner">
          <div>
            <div className="lp-badge">
              <Sparkles size={14} />
              Platform Bisnis Digital #1 Indonesia
            </div>
            <h1 className="lp-hero-title">
              {settings.hero_title}<br /><span className="accent">{settings.hero_subtitle}</span>
            </h1>
            <p className="lp-hero-desc">{settings.hero_desc}</p>

            <div className="lp-hero-cta-row">
              <Link to="/register" className="lp-btn-primary-lg">
                Daftar Gratis Sekarang <ArrowRight size={16} />
              </Link>
              {settings.show_sandbox && (
                <button className="lp-btn-secondary-lg" onClick={() => scrollTo('fitur')}>
                  <MonitorSmartphone size={16} /> Lihat Fitur
                </button>
              )}
            </div>

            <div className="lp-trust-row">
              <div className="lp-trust-item"><Zap size={16} /> 4 Sektor Bisnis</div>
              <div className="lp-trust-item"><Timer size={16} /> Setup &lt; 5 Menit</div>
              <div className="lp-trust-item"><Gift size={16} /> Gratis Selamanya</div>
            </div>
          </div>

          {/* SANDBOX PANEL CARD CONDITIONAL */}
          {settings.show_sandbox ? (
            <div className="lp-sandbox">
              <div className="lp-sandbox-head">
                <div className="lp-sandbox-icon"><MonitorSmartphone size={20} /></div>
                <div>
                  <div className="lp-sandbox-title">Sandbox Instan</div>
                  <div className="lp-sandbox-sub">Coba Sistem Kategori Aktif</div>
                </div>
              </div>

              <p className="lp-sandbox-desc">
                Klik tombol uji coba di bawah untuk langsung masuk dan mengevaluasi modul aktif platform kami tanpa perlu mendaftar terlebih dahulu!
              </p>

              <div className="lp-demo-list">
                {categories
                  .filter(c => settings.featured_categories ? settings.featured_categories.includes(c.slug) : true)
                  .map(cat => {
                    const visual = SLUG_VISUALS[cat.slug] || { emoji: cat.icon || '📦', bg: `linear-gradient(135deg,${cat.color || '#3b82f6'},${cat.color || '#1d4ed8'})`, sub: cat.description || '' }
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => handleDemoLogin(cat.slug)}
                        disabled={demoLoading}
                        className="lp-demo-btn"
                      >
                        <span className="lp-demo-emoji" style={{ background: visual.bg }}>{visual.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div className="lp-demo-title">Demo {cat.name}</div>
                          <div className="lp-demo-sub">{visual.sub}</div>
                        </div>
                        <ArrowRight size={16} className="lp-demo-arrow" />
                      </button>
                    )
                  })}
              </div>

              <div className="lp-sandbox-foot">
                <ShieldCheck size={13} /> Sandbox aman &amp; terenkripsi
              </div>
            </div>
          ) : (
            <div className="lp-sandbox" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>⚡</div>
              <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: 18, fontWeight: 800 }}>Keandalan Berkelas Dunia</h4>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>
                Multi-tenant SaaS andal dengan tingkat SLA 99.9% untuk mendigitalisasi usaha Anda secara instan.
              </p>
            </div>
          )}
        </div>

        {/* CAMPAIGN STRIP CONDITIONAL */}
        {settings.campaign_active && (
          <div className="lp-campaign">
            <div className="lp-campaign-inner">
              <div className="lp-campaign-text">
                <Gift size={20} />
                <strong>{settings.campaign_text}</strong>
              </div>
              <button className="lp-campaign-btn" onClick={() => scrollTo('fitur')}>
                Mulai Test Kategori <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FITUR SECTION CONDITIONAL */}
      {settings.show_features && (
        <div className="lp-section" id="fitur">
          <div className="lp-section-head">
            <div className="lp-tag">Fitur Unggulan</div>
            <h2 className="lp-title">Semua yang dibutuhkan bisnis Anda</h2>
            <p className="lp-desc">Dirancang khusus untuk 4 sektor bisnis utama di Indonesia — dari pencatatan sederhana hingga analitik bisnis tingkat lanjut.</p>
          </div>

          <div className="lp-tabs">
            {['all', ...features.map(f => f.category)].map(tab => {
              const catObj = features.find(f => f.category === tab);
              return (
                <button
                  key={tab}
                  className={`lp-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? 'Semua' : catObj ? catObj.name : tab}
                </button>
              );
            })}
          </div>

          <div className="lp-feat-grid">
            {filteredFeatures.map(feat => (
              <div key={feat.id} className="lp-feat-card" onClick={() => handleDemoLogin(feat.category)}>
                <div className="lp-feat-icon-bg" style={{ background: `${feat.color}20` }}>
                  {feat.icon}
                </div>
                <div className="lp-feat-name">{feat.name}</div>
                <div className="lp-feat-desc">{feat.desc}</div>
                <div className="lp-feat-pills">
                  {feat.pills.map(pill => <span key={pill} className="lp-pill">{pill}</span>)}
                </div>
                <div className="lp-feat-cta">
                  <Zap size={13} /> Uji Coba Modul Ini <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <div className="lp-section lp-section-alt" id="how-it-works">
        <div className="lp-section-head">
          <div className="lp-tag">Cara Kerja</div>
          <h2 className="lp-title">Mulai dalam 4 langkah mudah</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((step, i) => (
            <div className="lp-step" key={step.title}>
              <div className="lp-step-line" />
              <div className="lp-step-num"><step.icon size={22} /></div>
              <div className="lp-step-title">{i + 1}. {step.title}</div>
              <div className="lp-step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIAL CONDITIONAL */}
      {settings.show_testimonials && (
        <div className="lp-section" id="testimoni">
          <div className="lp-section-head">
            <div className="lp-tag">Testimoni</div>
            <h2 className="lp-title">Dipercaya ribuan pelaku bisnis Indonesia</h2>

            {!testimonialsLoading && testimonials.length > 2 && (
              <div className="lp-testi-nav">
                <button type="button" onClick={prevSlide} className="lp-testi-nav-btn" aria-label="Sebelumnya">
                  <ChevronLeft size={17} />
                </button>
                <button type="button" onClick={nextSlide} className="lp-testi-nav-btn" aria-label="Berikutnya">
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </div>

          <div className="lp-testi-grid" ref={testiTrackRef}>
            {testimonialsLoading ? (
              <div className="lp-testi-empty">Memuat ulasan...</div>
            ) : testimonials.length === 0 ? (
              <div className="lp-testi-empty">Belum ada ulasan aktif yang dipublikasikan.</div>
            ) : (
              testimonials.map(testi => (
                <div key={testi.id} className="lp-testi-card">
                  <div className="lp-testi-stars">
                    {'★'.repeat(testi.stars)}{'☆'.repeat(5 - testi.stars)}
                  </div>
                  <div className="lp-testi-text">"{testi.text}"</div>
                  <div className="lp-testi-author">
                    <div className="lp-testi-avatar" style={{ background: testi.avatar_bg || '#e2e8f0', color: testi.avatar_color || '#475569' }}>
                      {testi.avatar_text || '??'}
                    </div>
                    <div>
                      <div className="lp-testi-name">{testi.name}</div>
                      <div className="lp-testi-role">{testi.role}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CUSTOMER FEEDBACK SUBMISSION WIDGET */}
          <div className="lp-feedback">
            <h3 className="lp-feedback-title">✍️ Bagikan Cerita Sukses Anda</h3>
            <p className="lp-feedback-desc">
              Punya pengalaman menyenangkan menggunakan BIZORA? Bagikan cerita Anda sekarang! Ulasan Anda akan ditinjau oleh Admin sebelum ditayangkan.
            </p>

            {submitSuccess ? (
              <div className="lp-feedback-success">
                🎉 Terima kasih banyak! Ulasan Anda telah berhasil dikirim ke Admin untuk ditinjau terlebih dahulu. Cerita sukses Anda sangat berharga bagi komunitas BIZORA Indonesia! 🙏
              </div>
            ) : (
              <form onSubmit={handleSubmitTestimonial}>
                <div className="lp-form-grid">
                  <div className="lp-form-group">
                    <label className="lp-form-label">Nama Lengkap</label>
                    <input
                      type="text" required placeholder="Contoh: Ahmad Apoteker" className="lp-form-input"
                      value={submitForm.name}
                      onChange={e => setSubmitForm({ ...submitForm, name: e.target.value })}
                    />
                  </div>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Jenis Usaha &amp; Kota</label>
                    <input
                      type="text" required placeholder="Contoh: Pemilik Apotek, Jakarta" className="lp-form-input"
                      value={submitForm.role}
                      onChange={e => setSubmitForm({ ...submitForm, role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="lp-form-group" style={{ marginBottom: 4 }}>
                  <label className="lp-form-label">Rating Bintang</label>
                  <div className="lp-star-picker">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`lp-star ${star <= submitForm.stars ? 'active' : ''}`}
                        onClick={() => setSubmitForm({ ...submitForm, stars: star })}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lp-form-group" style={{ marginBottom: 18 }}>
                  <label className="lp-form-label">Kutipan Pengalaman / Review</label>
                  <textarea
                    required rows="4" placeholder="Tulis ulasan jujur atau cerita sukses Anda menggunakan platform kami..."
                    className="lp-form-textarea"
                    value={submitForm.text}
                    onChange={e => setSubmitForm({ ...submitForm, text: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={submitting} className="lp-submit-btn">
                  {submitting ? 'Mengirim Ulasan...' : <>🚀 Kirim Cerita Sukses Anda</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FINAL CTA CAMPAIGN */}
      <div className="lp-cta-final">
        <div className="lp-cta-title">Siap digitalisasi bisnis Anda?</div>
        <div className="lp-cta-desc">Bergabunglah bersama pelaku bisnis yang sudah merasakan manfaatnya. Gratis selamanya untuk fitur dasar.</div>
        <div className="lp-cta-actions">
          {user ? (
            <Link to="/dashboard" className="lp-cta-btn-solid">Masuk Ke Dashboard <ArrowUpRight size={16} /></Link>
          ) : (
            <>
              <Link to="/register" className="lp-cta-btn-solid">Daftar Gratis Sekarang <ArrowUpRight size={16} /></Link>
              <Link to="/login" className="lp-cta-btn-outline">Masuk Login</Link>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="lp-footer">
        <div className="lp-footer-grid">
          <div>
            <div className="lp-footer-brand-logo">
              <div className="lp-nav-logo-icon">
                <img src={settings.landing_logo_url || bizoraLogo} alt="BIZORA Logo" />
              </div>
              <span className="lp-footer-brand-name">BIZORA</span>
            </div>
            <p className="lp-footer-brand-desc">
              Platform digital terpadu untuk mengelola retail, budidaya, dan kuliner — satu sistem untuk seluruh operasional bisnis Anda.
            </p>
          </div>

          <div className="lp-footer-col">
            <div className="lp-footer-col-title">Produk</div>
            {categories.slice(0, 4).map(c => (
              <span key={c.slug} className="lp-footer-link" onClick={() => scrollTo('fitur')}>{c.name}</span>
            ))}
          </div>

          <div className="lp-footer-col">
            <div className="lp-footer-col-title">Perusahaan</div>
            <span className="lp-footer-link" onClick={() => scrollTo('how-it-works')}>Cara Kerja</span>
            <span className="lp-footer-link" onClick={() => scrollTo('testimoni')}>Testimoni</span>
            <span className="lp-footer-link">Bantuan</span>
            <span className="lp-footer-link">Kontak</span>
          </div>

          <div className="lp-footer-col">
            <div className="lp-footer-col-title">Legal</div>
            <span className="lp-footer-link">Kebijakan Privasi</span>
            <span className="lp-footer-link">Syarat &amp; Ketentuan</span>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <div className="lp-footer-copy">© 2026 BIZORA Indonesia. Semua hak dilindungi.</div>
          <div className="lp-footer-badges">
            <span>🔒 Data Terenkripsi</span>
            <span>🇮🇩 Dibuat di Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  )
}
