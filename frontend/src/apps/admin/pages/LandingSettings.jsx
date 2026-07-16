import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import bizoraLogo from '../../../assets/bizora-logo.png'

export default function LandingSettings() {
  const [activeTab, setActiveTab] = useState('general') // 'general' or 'testimonials'
  
  // Tab 1: General settings state
  const [form, setForm] = useState({
    hero_title: 'Kelola Bisnis Anda',
    hero_subtitle: 'Lebih Cerdas & Mudah',
    hero_desc: 'Satu platform untuk retail, budidaya ikan, kuliner, dan jasa.',
    campaign_text: 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat bisnis Anda naik tingkat.',
    campaign_active: true,
    show_sandbox: true,
    show_features: true,
    show_testimonials: true,
    featured_categories: ['retail', 'fish', 'culinary', 'service'],
    bank_name: 'BANK BCA',
    bank_account_no: '8837 001 992',
    bank_account_name: 'PT Antigravity Global SaaS',
    price_basic: 149000,
    price_pro: 299000,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Tab 2: Testimonials state
  const [testimonials, setTestimonials] = useState([])
  const [dbCategories, setDbCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTesti, setEditingTesti] = useState(null)
  const [testiForm, setTestiForm] = useState({
    name: '',
    role: '',
    text: '',
    stars: 5,
    active: true
  })
  const [testiSaving, setTestiSaving] = useState(false)

  useEffect(() => {
    fetchGeneralSettings()
    fetchTestimonials()
    fetchCategories()
  }, [])

  const fetchCategories = () => {
    api.get('/categories/public')
      .then(r => setDbCategories(r.data?.data || []))
      .catch(e => console.error(e))
  }

  const fetchGeneralSettings = () => {
    setLoading(true)
    api.get('/landing-settings')
      .then(r => {
        if (r.data?.data) {
          setForm(r.data.data)
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }

  const fetchTestimonials = () => {
    api.get('/admin/testimonials')
      .then(r => {
        if (r.data?.data) {
          setTestimonials(r.data.data)
        }
      })
      .catch(e => console.error(e))
  }

  const handleSaveGeneral = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await api.post('/admin/landing-settings', form)
      setMsg('Pengaturan portal berhasil disimpan! 🎉')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || 'Koneksi gagal'))
    } finally {
      setSaving(false)
    }
  }

  // --- Testimonials CRUD Handlers ---
  const openAddTesti = () => {
    setEditingTesti(null)
    setTestiForm({ name: '', role: '', text: '', stars: 5, active: true })
    setShowModal(true)
  }

  const openEditTesti = (testi) => {
    setEditingTesti(testi)
    setTestiForm({
      name: testi.name,
      role: testi.role,
      text: testi.text,
      stars: testi.stars,
      active: testi.active
    })
    setShowModal(true)
  }

  const handleSaveTesti = async (e) => {
    e.preventDefault()
    if (!testiForm.name.trim() || !testiForm.role.trim() || !testiForm.text.trim()) return
    setTestiSaving(true)
    try {
      if (editingTesti) {
        // Edit Testimonial
        const r = await api.put(`/admin/testimonials/${editingTesti.id}`, testiForm)
        setTestimonials(v => v.map(t => t.id === editingTesti.id ? r.data.data : t))
      } else {
        // Create Testimonial
        const r = await api.post('/admin/testimonials', testiForm)
        setTestimonials(v => [r.data.data, ...v])
      }
      setShowModal(false)
      setMsg('Testimoni berhasil disimpan! 💬')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert('Gagal menyimpan testimoni: ' + (err.response?.data?.message || 'Koneksi gagal'))
    } finally {
      setTestiSaving(false)
    }
  }

  const handleDeleteTesti = async (id) => {
    if (!window.confirm('Hapus testimoni ini secara permanen?')) return
    try {
      await api.delete(`/admin/testimonials/${id}`)
      setTestimonials(v => v.filter(t => t.id !== id))
      setMsg('Testimoni berhasil dihapus! 🗑️')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      alert('Gagal menghapus testimoni')
    }
  }

  const handleToggleTesti = async (id, currentActive) => {
    setTestimonials(v => v.map(t => t.id === id ? { ...t, active: !currentActive } : t))
    try {
      await api.patch(`/admin/testimonials/${id}/toggle`)
    } catch (err) {
      // Revert if API failed
      setTestimonials(v => v.map(t => t.id === id ? { ...t, active: currentActive } : t))
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border-default)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="page-title">Pengaturan Portal Web</h2>
          <p className="page-sub">Kustomisasi teks banner, elemen visual, dan testimoni pelanggan yang ditampilkan pada Landing Page publik.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-default)', marginBottom: 24, paddingBottom: 2 }}>
        <button 
          type="button" 
          onClick={() => setActiveTab('general')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'general' ? '3px solid var(--primary-500)' : '3px solid transparent',
            color: activeTab === 'general' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          🚀 Pengaturan Teks & Elemen
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('testimonials')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'testimonials' ? '3px solid var(--primary-500)' : '3px solid transparent',
            color: activeTab === 'testimonials' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          💬 Kelola Testimoni Pelanggan
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('billing')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'billing' ? '3px solid var(--primary-500)' : '3px solid transparent',
            color: activeTab === 'billing' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          💳 Harga Paket & Rekening BCA
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('logo')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'logo' ? '3px solid var(--primary-500)' : '3px solid transparent',
            color: activeTab === 'logo' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          🎨 Logo & Branding
        </button>
      </div>

      {msg && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(13, 148, 136, 0.12))',
          border: '1px solid #10b981',
          borderRadius: 12,
          padding: '14px 20px',
          color: '#10b981',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
        }}>
          {msg}
        </div>
      )}

      {/* TAB CONTENT: GENERAL TEXT & VISIBILITY CONFIG */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30, alignItems: 'start' }}>
          {/* FORM PANEL */}
          <form onSubmit={handleSaveGeneral} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Section: Hero Banner */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🚀</span> Bagian Hero Utama
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Atur judul dan deskripsi utama yang memikat calon pengguna di halaman beranda.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>JUDUL BESAR (BARIS 1)</label>
                  <input 
                    className="form-input" 
                    value={form.hero_title}
                    onChange={e => setForm({...form, hero_title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>TEKS WARNA-WARNI (BARIS 2)</label>
                  <input 
                    className="form-input" 
                    value={form.hero_subtitle}
                    onChange={e => setForm({...form, hero_subtitle: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>DESKRIPSI HERO</label>
                  <textarea 
                    className="form-input" 
                    rows="3"
                    value={form.hero_desc || ''}
                    onChange={e => setForm({...form, hero_desc: e.target.value})}
                    required
                    style={{ resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', margin: 0 }} />

            {/* Section: Promo Strip */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎉</span> Banner Promo Berjalan
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Pasang pengumuman, diskon, atau promo menarik di bawah hero banner.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Aktifkan Banner Promo</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tampilkan garis promo oranye tepat di bawah hero</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({...form, campaign_active: !form.campaign_active})}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: form.campaign_active ? '#10b981' : '#94a3b8',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      left: form.campaign_active ? 24 : 2,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                    }} />
                  </button>
                </div>

                {form.campaign_active && (
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>KALIMAT PROMO</label>
                    <textarea 
                      className="form-input" 
                      rows="3"
                      value={form.campaign_text || ''}
                      onChange={e => setForm({...form, campaign_text: e.target.value})}
                      required
                      style={{ resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </div>
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', margin: 0 }} />

            {/* Section: Visibility Controls */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚙️</span> Pengaturan Visibilitas Elemen
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Aktifkan atau sembunyikan section tertentu sesuai kesiapan platform.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'show_sandbox', title: 'Panel Sandbox Instan', desc: 'Tombol uji coba demo kategori langsung di sisi hero' },
                  { key: 'show_features', title: 'Section Fitur Unggulan', desc: 'Daftar card modul Retail, Budidaya, dan Kuliner' },
                  { key: 'show_testimonials', title: 'Section Testimoni Pengguna', desc: 'Kartu review dari para pemilik usaha retail/kolam' }
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{item.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({...form, [item.key]: !form[item.key]})}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: form[item.key] ? '#10b981' : '#94a3b8',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        left: form[item.key] ? 24 : 2,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                      }} />
                    </button>
                  </div>
                ))}
              </div>

              {form.show_features && (
                <div style={{ marginTop: 20, background: 'var(--bg-elevated)', padding: '16px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Pilih Kategori Unggulan</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dbCategories.map(cat => (
                      <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={form.featured_categories?.includes(cat.slug)}
                          onChange={e => {
                            const newCats = e.target.checked
                              ? [...(form.featured_categories || []), cat.slug]
                              : (form.featured_categories || []).filter(slug => slug !== cat.slug)
                            setForm({...form, featured_categories: newCats})
                          }}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary"
              style={{ 
                padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 600, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 10, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
              }}
            >
              {saving ? (
                <span className="spinner" style={{ width: 18, height: 18 }}></span>
              ) : (
                '💾 Simpan Konfigurasi Portal'
              )}
            </button>
          </form>

          {/* LIVE MOCKUP PREVIEW */}
          <div style={{ position: 'sticky', top: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🖥️</span> Pratonton Realtime (Desktop Mockup)
            </h3>
            
            <div style={{
              background: '#093c2d', 
              borderRadius: 16,
              border: '4px solid #1e293b',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              aspectRatio: '1.4 / 1',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Outfit, sans-serif'
            }}>
              {/* Header mock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 18, background: '#fff', padding: '1px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={form.landing_logo_url || bizoraLogo} alt="BIZORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>BIZORA</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>
                  <span>Beranda</span>
                  <span>Fitur</span>
                  <span>Cara Kerja</span>
                </div>
              </div>

              {/* Hero Mock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, padding: 18, flex: 1, alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 7, fontWeight: 600, color: '#2dd4bf', background: 'rgba(45,212,191,0.15)', padding: '2px 6px', borderRadius: 10 }}>
                    BISNIS DIGITAL #1 INDONESIA
                  </span>
                  <h1 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '6px 0 4px 0', lineHeight: 1.2 }}>
                    {form.hero_title}<br />
                    <span style={{ color: '#2dd4bf' }}>{form.hero_subtitle}</span>
                  </h1>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {form.hero_desc}
                  </p>
                </div>

                {/* Sandbox Mock */}
                {form.show_sandbox ? (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 8 }}>💻</span>
                      <div>
                        <div style={{ fontSize: 8, fontWeight: 600, color: '#fff' }}>Sandbox Instan</div>
                        <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)' }}>Coba Sistem Kategori Aktif</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ background: '#3b82f6', height: 12, borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 6, color: '#fff', fontWeight: 600 }}>🛒 Demo Toko Retail</div>
                      <div style={{ background: '#10b981', height: 12, borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 6, color: '#fff', fontWeight: 600 }}>🐟 Demo Budidaya Ikan</div>
                      <div style={{ background: '#84cc16', height: 12, borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 6, color: '#fff', fontWeight: 600 }}>🌱 Demo Budidaya Tanam</div>
                      <div style={{ background: '#ef4444', height: 12, borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 6, color: '#fff', fontWeight: 600 }}>🍱 Demo Kuliner Resto</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 10, color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>
                    Sandbox Disembunyikan
                  </div>
                )}
              </div>

              {/* Campaign Strip Mock */}
              {form.campaign_active && (
                <div style={{
                  background: 'linear-gradient(90deg, #ba7517, #ef4444)',
                  padding: '6px 12px',
                  fontSize: 7,
                  color: '#fff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>📣</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{form.campaign_text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TESTIMONIALS CONFIG CRUD */}
      {activeTab === 'testimonials' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Daftar Testimoni Aktif</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Kelola daftar ulasan pelanggan yang muncul di halaman beranda publik.</p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={openAddTesti}
              style={{ padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              💬 + Tambah Testimoni Baru
            </button>
          </div>

          {testimonials.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>💬</span>
              Belum ada testimoni. Klik "+ Tambah Testimoni Baru" untuk menambahkan ulasan pertama!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {testimonials.map(testi => (
                <div key={testi.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16, border: '1px solid var(--border-default)', transition: 'transform 0.2s ease', position: 'relative' }}>
                  
                  {/* Status active badge */}
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: testi.active ? '#10b981' : '#64748b' }}>
                      {testi.active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleTesti(testi.id, testi.active)}
                      style={{
                        width: 32,
                        height: 18,
                        borderRadius: 9,
                        background: testi.active ? '#10b981' : '#94a3b8',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        left: testi.active ? 16 : 2,
                        transition: 'all 0.2s ease',
                      }} />
                    </button>
                  </div>

                  <div>
                    {/* Stars */}
                    <div style={{ color: '#fbbf24', fontSize: 14, marginBottom: 8 }}>
                      {'★'.repeat(testi.stars)}{'☆'.repeat(5 - testi.stars)}
                    </div>
                    {/* Review text */}
                    <p style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 16px 0' }}>
                      "{testi.text}"
                    </p>
                  </div>

                  {/* Review author profile */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)', paddingTop: 14 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: testi.avatar_bg || '#e2e8f0',
                        color: testi.avatar_color || '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {testi.avatar_text || '??'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{testi.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{testi.role}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        type="button" 
                        onClick={() => openEditTesti(testi)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-500)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 4 }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteTesti(testi.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 4 }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ADD / EDIT TESTIMONIAL MODAL --- */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, fontFamily: 'Outfit, sans-serif'
        }}>
          <form 
            onSubmit={handleSaveTesti} 
            className="card" 
            style={{ width: '100%', maxWidth: '460px', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {editingTesti ? '💬 Edit Ulasan Pelanggan' : '💬 Tambah Ulasan Baru'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>NAMA PELANGGAN</label>
              <input 
                className="form-input" 
                placeholder="Contoh: Siti Rahayu"
                value={testiForm.name}
                onChange={e => setTestiForm({...testiForm, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>PERAN / JABATAN & LOKASI</label>
              <input 
                className="form-input" 
                placeholder="Contoh: Pemilik Warung Makan, Malang"
                value={testiForm.role}
                onChange={e => setTestiForm({...testiForm, role: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>RATING BINTANG</label>
              <select 
                className="form-input" 
                value={testiForm.stars}
                onChange={e => setTestiForm({...testiForm, stars: parseInt(e.target.value)})}
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              >
                {[5, 4, 3, 2, 1].map(star => (
                  <option key={star} value={star}>{'★'.repeat(star) + '☆'.repeat(5-star)} ({star} Bintang)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>TEKS ULASAN / KUTIPAN</label>
              <textarea 
                className="form-input" 
                rows="4"
                placeholder="Tulis ulasan jujur atau review singkat pelanggan di sini..."
                value={testiForm.text}
                onChange={e => setTestiForm({...testiForm, text: e.target.value})}
                required
                style={{ resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-default)', marginTop: 4 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Ulasan Langsung Aktif</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tampilkan ulasan ini di landing page publik segera</span>
              </div>
              <button
                type="button"
                onClick={() => setTestiForm({...testiForm, active: !testiForm.active})}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: testiForm.active ? '#10b981' : '#cbd5e1',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  left: testiForm.active ? 20 : 2,
                  transition: 'all 0.2s ease',
                }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: 18, marginTop: 6 }}>
              <button 
                type="button" 
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={testiSaving}
                className="btn btn-primary"
                style={{ padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
              >
                {testiSaving ? 'Menyimpan...' : '💾 Simpan Testimoni'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB CONTENT: BILLING & PRICING CONFIG */}
      {activeTab === 'billing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30, alignItems: 'start' }}>
          {/* FORM PANEL */}
          <form onSubmit={handleSaveGeneral} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Section: Rekening Bank */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏦</span> Informasi Rekening Pembayaran (BCA)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Atur rekening tujuan transfer manual yang akan ditampilkan kepada tenant saat proses upgrade.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>NAMA BANK</label>
                  <input 
                    className="form-input" 
                    value={form.bank_name || ''}
                    onChange={e => setForm({...form, bank_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>NOMOR REKENING</label>
                  <input 
                    className="form-input" 
                    value={form.bank_account_no || ''}
                    onChange={e => setForm({...form, bank_account_no: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>ATAS NAMA (A.N.)</label>
                  <input 
                    className="form-input" 
                    value={form.bank_account_name || ''}
                    onChange={e => setForm({...form, bank_account_name: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', margin: 0 }} />

            {/* Section: Harga Paket */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💰</span> Harga Dasar Paket SaaS (Bulanan)
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Tentukan harga dasar bulanan untuk paket Basic dan Pro. Harga ini akan otomatis disesuaikan jika ada diskon aktif per kategori.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>HARGA PAKET BASIC (RP)</label>
                  <input 
                    type="number"
                    className="form-input" 
                    value={form.price_basic || 0}
                    onChange={e => setForm({...form, price_basic: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>HARGA PAKET PRO (RP)</label>
                  <input 
                    type="number"
                    className="form-input" 
                    value={form.price_pro || 0}
                    onChange={e => setForm({...form, price_pro: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                  padding: '12px 28px',
                  borderRadius: 10,
                  background: 'var(--primary-500)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                {saving ? 'Menyimpan...' : '✓ Simpan Pengaturan'}
              </button>
            </div>
          </form>

          {/* PREVIEW PANEL */}
          <div className="card" style={{ padding: 28, background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>💳 Visualisasi Halaman Langganan Tenant</h4>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Berikut adalah tampilan instruksi pembayaran yang akan dilihat oleh tenant Anda:</p>
            </div>

            <div style={{ background: 'var(--bg-base)', padding: 20, borderRadius: 12, border: '1px solid var(--border-default)' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 600 }}>Instruksi Pembayaran:</h5>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Silakan lakukan transfer sesuai nominal paket ke rekening berikut:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{form.bank_name}</div>
                    <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '0.05em' }}>{form.bank_account_no}</div>
                  </div>
                  <span style={{ fontSize: 10, background: 'var(--border-default)', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>Salin</span>
                </div>
                <div style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-muted)' }}>a.n. <strong>{form.bank_account_name}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-default)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Paket Basic (Bulanan):</span>
                <strong style={{ color: 'var(--text-primary)' }}>Rp {(form.price_basic || 0).toLocaleString('id-ID')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Paket Pro (Bulanan):</span>
                <strong style={{ color: 'var(--text-primary)' }}>Rp {(form.price_pro || 0).toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOGO & BRANDING */}
      {activeTab === 'logo' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 10 }}>
          {/* Uploader 1: Logo Landing Page */}
          <LogoUploaderCard
            title="Logo Landing Page (Public)"
            description="Logo yang akan ditampilkan pada navigasi atas dan footer landing page publik."
            type="landing"
            currentUrl={form.landing_logo_url}
            defaultLogo={bizoraLogo}
            onUploadSuccess={(url) => setForm({ ...form, landing_logo_url: url })}
            onResetSuccess={() => setForm({ ...form, landing_logo_url: null })}
          />

          {/* Uploader 2: Logo Admin SaaS */}
          <LogoUploaderCard
            title="Logo Admin SaaS"
            description="Logo yang akan ditampilkan pada sidebar kiri panel dashboard SaaS admin."
            type="admin"
            currentUrl={form.admin_logo_url}
            defaultLogo={bizoraLogo}
            onUploadSuccess={(url) => setForm({ ...form, admin_logo_url: url })}
            onResetSuccess={() => setForm({ ...form, admin_logo_url: null })}
          />
        </div>
      )}

    </div>
  )
}

function LogoUploaderCard({ title, description, type, currentUrl, defaultLogo, onUploadSuccess, onResetSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (PNG, JPG, SVG, dll)')
      return
    }
    // Client-side size check: 5MB = 5 * 1024 * 1024 = 5242880 bytes
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 5MB. File Anda: ' + (file.size / (1024 * 1024)).toFixed(1) + 'MB')
      return
    }
    
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await api.post('/admin/landing-settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.data?.success) {
        onUploadSuccess(res.data.data.url)
      }
    } catch (err) {
      const errData = err.response?.data
      const errMsg = errData?.message || (errData?.errors?.file && errData.errors.file[0]) || 'Terjadi kesalahan'
      alert('Gagal mengunggah logo: ' + errMsg)
    } finally {
      setUploading(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Kembalikan logo ke default?')) return
    setUploading(true)
    try {
      const res = await api.post('/admin/landing-settings/reset-logo', { type })
      if (res.data?.success) {
        onResetSuccess()
      }
    } catch (err) {
      alert('Gagal mengembalikan logo ke default')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{description}</p>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: dragOver ? '2px dashed var(--primary-500)' : '2px dashed var(--border-default)',
          background: dragOver ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-elevated)',
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          transition: 'all 0.2s ease',
          minHeight: 180,
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById(`file-input-${type}`).click()}
      >
        <input 
          id={`file-input-${type}`}
          type="file" 
          accept="image/*" 
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="spinner" style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mengunggah...</span>
          </div>
        ) : (
          <>
            <div style={{ 
              width: 90, 
              height: 90, 
              background: '#fff', 
              borderRadius: 12, 
              padding: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid var(--border-default)'
            }}>
              <img 
                src={currentUrl || defaultLogo} 
                alt={`${title} Preview`} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-500)' }}>Pilih berkas</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> atau tarik gambar ke sini</span>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Format PNG, JPG, atau SVG (Maks. 5MB)</div>
            </div>
          </>
        )}
      </div>

      {currentUrl && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleReset(); }}
          className="btn btn-ghost"
          style={{ 
            color: '#ef4444', 
            borderColor: 'rgba(239, 68, 68, 0.2)',
            width: '100%', 
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          🗑️ Hapus & Gunakan Logo Default
        </button>
      )}
    </div>
  )
}
