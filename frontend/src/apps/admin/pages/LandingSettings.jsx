import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/api'
import CurrencyInput from '../../../components/CurrencyInput'
import bizoraLogo from '../../../assets/bizora-logo.png'
export default function LandingSettings() {
  const [activeTab, setActiveTab] = useState('general') // 'general' or 'testimonials'
  
  // Tab 1: General settings state
  const [form, setForm] = useState({
    hero_title: 'Kelola Bisnis Anda',
    hero_subtitle: 'Lebih Cerdas & Mudah',
    hero_desc: 'Satu platform untuk retail, Budidaya Hewan, kuliner, dan jasa.',
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
    features_platform: [],
    how_it_works_steps: [],
    faq_items: [],
    roi_title: '',
    roi_desc: '',
    footer_brand_desc: '',
    footer_address: '',
    footer_phone: '',
    footer_email: '',
    footer_security_text: '',
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

  // Scrolls to top so the status banner (rendered near the top of the page)
  // is actually visible, then shows it — otherwise a save made while scrolled
  // down (e.g. editing the Fitur Platform list) goes unnoticed.
  const showMsg = (text) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleSaveGeneral = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await api.post('/admin/landing-settings', form)
      showMsg('Pengaturan portal berhasil disimpan! 🎉')
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || 'Koneksi gagal'))
    } finally {
      setSaving(false)
    }
  }

  // --- Generic list-editing helpers, shared by the Fitur Platform, Cara
  //     Kerja, and FAQ tabs (all three are just "array of objects" fields) ---
  const addListItem = (key, emptyItem) => {
    setForm(f => ({ ...f, [key]: [...(f[key] || []), emptyItem] }))
  }
  const removeListItem = (key, idx) => {
    setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }))
  }
  const moveListItem = (key, idx, dir) => {
    setForm(f => {
      const list = [...f[key]]
      const target = idx + dir
      if (target < 0 || target >= list.length) return f
      ;[list[idx], list[target]] = [list[target], list[idx]]
      return { ...f, [key]: list }
    })
  }
  const updateListItem = (key, idx, field, value) => {
    setForm(f => {
      const list = [...f[key]]
      list[idx] = { ...list[idx], [field]: value }
      return { ...f, [key]: list }
    })
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
      showMsg('Testimoni berhasil disimpan! 💬')
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
      showMsg('Testimoni berhasil dihapus! 🗑️')
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
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-default)', marginBottom: 24, paddingBottom: 2, flexWrap: 'wrap' }}>
        {[
          { key: 'general', label: '🚀 Pengaturan Teks & Elemen' },
          { key: 'sectors', label: '🏷️ Sektor Bisnis' },
          { key: 'features', label: '✨ Fitur Platform' },
          { key: 'howitworks', label: '🧭 Cara Kerja' },
          { key: 'faq', label: '❓ FAQ' },
          { key: 'testimonials', label: '💬 Kelola Testimoni Pelanggan' },
          { key: 'billing', label: '💳 Harga Paket & Rekening BCA' },
          { key: 'logo', label: '🎨 Logo & Branding' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary-500)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
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
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>TEKS WARNA-WARNI (BARIS 2) — OPSIONAL</label>
                  <input
                    className="form-input"
                    placeholder="Kosongkan jika judul cukup 1 baris"
                    value={form.hero_subtitle || ''}
                    onChange={e => setForm({...form, hero_subtitle: e.target.value})}
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
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tampilkan bar promo sticky di bagian bawah layar landing page</span>
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
                  { key: 'show_features', title: 'Section Sektor Bisnis & Fitur', desc: 'Tab spesialisasi per kategori bisnis, plus daftar fitur unggulan platform' },
                  { key: 'show_testimonials', title: 'Section Testimoni Pengguna', desc: 'Kartu review dari para pemilik usaha retail/kolam, bisa digeser' }
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
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Pilih Kategori Unggulan</h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Menentukan kategori mana yang muncul di tombol demo Sandbox Instan dan tab Sektor Bisnis. Kosongkan semua centang untuk menampilkan seluruh kategori aktif.</p>
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

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', margin: 0 }} />

            {/* Section: Footer */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🦶</span> Footer
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Deskripsi brand, kontak, dan teks keamanan di bagian paling bawah landing page. Kolom "Sektor Usaha" di footer otomatis mengikuti kategori bisnis aktif.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>DESKRIPSI BRAND</label>
                  <textarea className="form-input" rows="2" value={form.footer_brand_desc || ''}
                    onChange={e => setForm({...form, footer_brand_desc: e.target.value})}
                    style={{ resize: 'vertical', lineHeight: 1.5 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>ALAMAT</label>
                    <input className="form-input" value={form.footer_address || ''}
                      onChange={e => setForm({...form, footer_address: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>NOMOR WHATSAPP CS</label>
                    <input className="form-input" value={form.footer_phone || ''}
                      onChange={e => setForm({...form, footer_phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>EMAIL BANTUAN</label>
                  <input className="form-input" type="email" value={form.footer_email || ''}
                    onChange={e => setForm({...form, footer_email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>TEKS KEAMANAN & LAYANAN</label>
                  <textarea className="form-input" rows="2" value={form.footer_security_text || ''}
                    onChange={e => setForm({...form, footer_security_text: e.target.value})}
                    style={{ resize: 'vertical', lineHeight: 1.5 }} />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', margin: 0 }} />

            {/* Section: ROI Calculator header */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🧮</span> Judul Simulasi Penghematan ROI
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Kalkulator ROI sendiri (slider transaksi, staf, hasil hitung) tidak bisa diubah — hanya judul dan deskripsi pembukanya.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>JUDUL</label>
                  <input className="form-input" value={form.roi_title || ''}
                    onChange={e => setForm({...form, roi_title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>DESKRIPSI</label>
                  <textarea className="form-input" rows="3" value={form.roi_desc || ''}
                    onChange={e => setForm({...form, roi_desc: e.target.value})}
                    style={{ resize: 'vertical', lineHeight: 1.5 }} />
                </div>
              </div>
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
                  <span>Testimoni</span>
                </div>
              </div>

              {/* Hero Mock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, padding: 18, flex: 1, alignItems: 'center', overflow: 'hidden' }}>
                <div>
                  <span style={{ fontSize: 7, fontWeight: 600, color: '#2dd4bf', background: 'rgba(45,212,191,0.15)', padding: '2px 6px', borderRadius: 10 }}>
                    PLATFORM BISNIS DIGITAL #1 INDONESIA
                  </span>
                  <h1 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '6px 0 4px 0', lineHeight: 1.2 }}>
                    {form.hero_title}
                    {form.hero_subtitle && <span style={{ color: '#2dd4bf' }}> {form.hero_subtitle}</span>}
                  </h1>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {form.hero_desc}
                  </p>
                </div>

                {/* Sandbox Mock — mirrors the real Hero's "Sandbox Instan" card,
                    listing whichever categories are checked below (or all, if none checked) */}
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
                      {(() => {
                        const shown = form.featured_categories?.length
                          ? dbCategories.filter(c => form.featured_categories.includes(c.slug))
                          : dbCategories
                        if (shown.length === 0) {
                          return (
                            <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', padding: '4px 2px' }}>
                              Belum ada kategori dipilih
                            </div>
                          )
                        }
                        return shown.slice(0, 4).map(cat => (
                          <div
                            key={cat.slug}
                            style={{ background: cat.color || '#3b82f6', height: 12, borderRadius: 3, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 6, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {cat.icon || '📦'} Demo {cat.name}
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 10, color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>
                    Sandbox Disembunyikan
                  </div>
                )}
              </div>

              {/* Promo Banner Mock — sticky bar at the bottom of the page, matching PromoBanner.jsx */}
              {form.campaign_active && (
                <div style={{
                  background: '#062c23',
                  borderTop: '1px solid #124d3f',
                  padding: '6px 12px',
                  fontSize: 7,
                  color: '#fff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 8 }}>🎁</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{form.campaign_text}</span>
                  </div>
                  <span style={{ background: '#10b981', color: '#03110e', padding: '3px 8px', borderRadius: 6, fontSize: 6, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Mulai Test Kategori
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SEKTOR BISNIS (pointer — actual editor lives on the Kategori Bisnis page) */}
      {activeTab === 'sectors' && (
        <div className="card" style={{ padding: 28, maxWidth: 640 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏷️</span> Konten Section "Spesialisasi Sektor Bisnis"
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Badge, headline, daftar fitur, dan statistik dampak yang tampil saat sebuah kategori dipilih di tab "Sektor Bisnis" pada landing page
            diatur <strong>per kategori</strong> — bukan di sini, melainkan di halaman <strong>Kategori Bisnis</strong>. Buka menu itu, edit kategori
            yang diinginkan, lalu isi bagian "Detail Panel Sektor (Landing Page)".
          </p>
          <Link to="/categories" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            🏷️ Buka Kategori Bisnis
          </Link>
        </div>
      )}

      {/* TAB CONTENT: FITUR PLATFORM (6 kartu di section "Fitur Unggulan Platform") */}
      {activeTab === 'features' && (
        <form onSubmit={handleSaveGeneral} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Fitur Unggulan Platform</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kartu-kartu fitur generik yang tampil untuk semua pengunjung, tidak terikat kategori bisnis tertentu.</p>
          </div>

          {(form.features_platform || []).map((feat, idx) => (
            <div key={idx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fitur #{idx + 1}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => moveListItem('features_platform', idx, -1)}>↑</button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={idx === form.features_platform.length - 1} onClick={() => moveListItem('features_platform', idx, 1)}>↓</button>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => removeListItem('features_platform', idx)}>🗑</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr', gap: 10 }}>
                <input className="form-input" placeholder="💳" value={feat.icon || ''} onChange={e => updateListItem('features_platform', idx, 'icon', e.target.value)} />
                <input className="form-input" placeholder="Judul fitur" value={feat.title || ''} onChange={e => updateListItem('features_platform', idx, 'title', e.target.value)} />
                <input className="form-input" placeholder="Tag (cth. Kasir Modern)" value={feat.tag || ''} onChange={e => updateListItem('features_platform', idx, 'tag', e.target.value)} />
              </div>
              <textarea className="form-input" rows={2} placeholder="Deskripsi fitur..." value={feat.description || ''}
                onChange={e => updateListItem('features_platform', idx, 'description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={() => addListItem('features_platform', { icon: '✨', title: '', tag: '', description: '' })}>
            + Tambah Fitur
          </button>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Menyimpan...' : '💾 Simpan Fitur Platform'}
          </button>
        </form>
      )}

      {/* TAB CONTENT: CARA KERJA (langkah-langkah di section "Kemudahan Akses") */}
      {activeTab === 'howitworks' && (
        <form onSubmit={handleSaveGeneral} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Cara Kerja / Kemudahan Akses</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Langkah-langkah bernomor yang menjelaskan cara mulai memakai Bizora. Nomor urut mengikuti urutan di sini.</p>
          </div>

          {(form.how_it_works_steps || []).map((step, idx) => (
            <div key={idx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Langkah {String(idx + 1).padStart(2, '0')}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => moveListItem('how_it_works_steps', idx, -1)}>↑</button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={idx === form.how_it_works_steps.length - 1} onClick={() => moveListItem('how_it_works_steps', idx, 1)}>↓</button>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => removeListItem('how_it_works_steps', idx)}>🗑</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 10 }}>
                <input className="form-input" placeholder="📝" value={step.icon || ''} onChange={e => updateListItem('how_it_works_steps', idx, 'icon', e.target.value)} />
                <input className="form-input" placeholder="Judul langkah" value={step.title || ''} onChange={e => updateListItem('how_it_works_steps', idx, 'title', e.target.value)} />
              </div>
              <textarea className="form-input" rows={2} placeholder="Deskripsi langkah..." value={step.description || ''}
                onChange={e => updateListItem('how_it_works_steps', idx, 'description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={() => addListItem('how_it_works_steps', { icon: '✅', title: '', description: '' })}>
            + Tambah Langkah
          </button>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Menyimpan...' : '💾 Simpan Cara Kerja'}
          </button>
        </form>
      )}

      {/* TAB CONTENT: FAQ */}
      {activeTab === 'faq' && (
        <form onSubmit={handleSaveGeneral} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Pertanyaan yang Sering Diajukan</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daftar FAQ di bagian bawah landing page, sebelum footer.</p>
          </div>

          {(form.faq_items || []).map((faq, idx) => (
            <div key={idx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FAQ #{idx + 1}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => moveListItem('faq_items', idx, -1)}>↑</button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={idx === form.faq_items.length - 1} onClick={() => moveListItem('faq_items', idx, 1)}>↓</button>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => removeListItem('faq_items', idx)}>🗑</button>
                </div>
              </div>
              <input className="form-input" placeholder="Pertanyaan" value={faq.q || ''} onChange={e => updateListItem('faq_items', idx, 'q', e.target.value)} />
              <textarea className="form-input" rows={3} placeholder="Jawaban..." value={faq.a || ''}
                onChange={e => updateListItem('faq_items', idx, 'a', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={() => addListItem('faq_items', { q: '', a: '' })}>
            + Tambah FAQ
          </button>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Menyimpan...' : '💾 Simpan FAQ'}
          </button>
        </form>
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
                  <CurrencyInput 
                    className="form-input" 
                    value={form.price_basic || 0}
                    onChange={e => setForm({...form, price_basic: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 600 }}>HARGA PAKET PRO (RP)</label>
                  <CurrencyInput 
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
                <div style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-muted)' }}>a.n. <strong style={{ fontWeight: 600 }}>{form.bank_account_name}</strong></div>
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
