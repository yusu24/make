import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../../lib/api'
import CurrencyInput from '../../../components/CurrencyInput'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import './Shared.css'

// ─── Per-category feature definitions (Extremely Granular) ────────────────────
const FEATURES_BY_CATEGORY = {
  'toko-retail': {
    pos:             { label: 'Mesin Kasir (POS) & Checkout', icon: '🧾' },
    pos_void:        { label: 'Pembatalan Transaksi (Void)', icon: '🚫' },
    pos_shifts:      { label: 'Manajemen Shift Kasir',       icon: '⏱️' },
    inventory:       { label: 'Manajemen Stok & Logistik',   icon: '📦' },
    stock_transfers: { label: 'Transfer Antar Cabang',       icon: '🚚' },
    stock_opname:    { label: 'Stock Opname Fisik',          icon: '📋' },
    batches:         { label: 'Pelacakan Batch & Expired',   icon: '⏳' },
    serials:         { label: 'Serial Number / IMEI',        icon: '🔢' },
    suppliers:       { label: 'Data Partner Supplier',       icon: '🏭' },
    customers:       { label: 'Data Pelanggan & CRM',        icon: '👥' },
    discounts:       { label: 'Diskon & Pricelist Grosir',   icon: '🏷️' },
    purchasing:      { label: 'Purchase Order (PO)',         icon: '🛒' },
    supplier_returns:{ label: 'Retur Pembelian Supplier',    icon: '↩️' },
    finance:         { label: 'Buku Kas & Biaya Operasional',icon: '💰' },
    payables:        { label: 'Buku Hutang & Piutang',       icon: '💳' },
    tax_report:      { label: 'Laporan Pajak / PPN',         icon: '📑' },
    reports:         { label: 'Laporan Penjualan & Laba',    icon: '📊' },
    multiUser:       { label: 'Multi-User Staf & Kasir',     icon: '👨‍💼' },
    multiOutlet:     { label: 'Multi-Cabang / Gudang',       icon: '🏬' },
    print_labels:    { label: 'Cetak Barcode & Label Produk',icon: '🏷️' },
    exportExcel:     { label: 'Export Data Excel/PDF',       icon: '📁' },
    apiAccess:       { label: 'Akses API Developer',         icon: '🔌' },
    prioritySupport: { label: 'Priority Support 24/7',       icon: '🎧' },
  },
  'budidaya-hewan': {
    ponds:           { label: 'Manajemen Kolam/Kandang', icon: '🏊' },
    cycles:          { label: 'Siklus Budidaya',      icon: '🔄' },
    feeding:         { label: 'Jadwal & Log Pakan',   icon: '🐟' },
    harvest:         { label: 'Pencatatan Panen',     icon: '🎣' },
    health:          { label: 'Catatan Kesehatan Hewan', icon: '🩺' },
    breeding:        { label: 'Silsilah Breeding',    icon: '🐾' },
    inventory:       { label: 'Stok Pakan & Obat',    icon: '📦' },
    finance:         { label: 'Keuangan & Biaya Pakan',icon: '💰' },
    reports:         { label: 'Laporan Budidaya',     icon: '📊' },
    multiUser:       { label: 'Multi-User Pekerja',   icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'budidaya-tanaman': {
    land:            { label: 'Manajemen Lahan & Petak', icon: '🌾' },
    cycles:          { label: 'Siklus Musim Tanam',   icon: '🔄' },
    fertilizer:      { label: 'Jadwal Pupuk & Nutrisi',icon: '🌿' },
    harvest:         { label: 'Pencatatan Hasil Panen',icon: '🌽' },
    health:          { label: 'Deteksi Hama & Gulma',  icon: '🐛' },
    inventory:       { label: 'Stok Benih & Pupuk',   icon: '📦' },
    finance:         { label: 'Keuangan Operasional Lahan',icon: '💰' },
    reports:         { label: 'Laporan Pertanian',    icon: '📊' },
    multiUser:       { label: 'Multi-User Staf Lapangan',icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'kuliner': {
    menu:            { label: 'Manajemen Menu & Varian', icon: '🍽️' },
    orders:          { label: 'Kasir POS & KDS Dapur', icon: '📋' },
    tables:          { label: 'Manajemen Meja & QR Order', icon: '🪑' },
    recipes:         { label: 'Resep & HPP Otomatis (BOM)', icon: '📝' },
    ingredients:     { label: 'Stok Bahan Baku Dapur', icon: '🧅' },
    modifiers:       { label: 'Topping & Pilihan Level', icon: '🎛️' },
    addons:          { label: 'Add-on Menu Tambahan', icon: '➕' },
    bundles:         { label: 'Paket Combo & Bundle',  icon: '🎁' },
    waste:           { label: 'Limbah, Basi & Waste Log', icon: '🗑️' },
    purchases:       { label: 'Pembelian Bahan Supplier', icon: '🛒' },
    shifts:          { label: 'Shift Kasir Restoran', icon: '🗄️' },
    analytics:       { label: 'Menu Engineering & Profit', icon: '📈' },
    delivery:        { label: 'Layanan Antar / Delivery', icon: '🛵' },
    reports:         { label: 'Laporan Penjualan & Margin', icon: '📊' },
    multiUser:       { label: 'Multi-User Waiter & Kasir', icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    storefront:      { label: 'Online Storefront Web',icon: '🌐' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'jasa': {
    workOrders:      { label: 'Surat Perintah Kerja (SPK)', icon: '📋' },
    contracts:       { label: 'Kontrak Layanan Berkala', icon: '📜' },
    spareparts:      { label: 'Stok Suku Cadang & Sparepart', icon: '⚙️' },
    services:        { label: 'Katalog Tarif Layanan Jasa', icon: '🛠️' },
    technicians:     { label: 'Penugasan Teknisi / Montir', icon: '👷' },
    finance:         { label: 'Keuangan SPK & Tagihan', icon: '💰' },
    reports:         { label: 'Laporan Layanan & Performa', icon: '📊' },
    multiUser:       { label: 'Multi-User Staf & Teknisi', icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'seller': {
    inventory:       { label: 'Stok & Gudang Seller', icon: '📦' },
    marketplace:     { label: 'Integrasi Marketplace',icon: '🛒' },
    sync:            { label: 'Sync Stok Otomatis Multi-Channel', icon: '🔄' },
    shipments:       { label: 'Pengiriman & Cetak Resi', icon: '🚚' },
    orders:          { label: 'Manajemen Pesanan Masuk', icon: '📋' },
    reports:         { label: 'Laporan Penjualan & Laba', icon: '📊' },
    multiUser:       { label: 'Multi-User Admin Packing', icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
}

// ─── Presentation per plan tier ───────────────────────────────────────────────
const PRESENTATION = {
  free:       { badge: 'badge-gray',   color: '#6b7280', gradient: 'linear-gradient(135deg,#6b7280,#374151)', icon: '🎁', tagline: 'Coba tanpa biaya' },
  basic:      { badge: 'badge-blue',   color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: '⭐', tagline: 'Ideal untuk bisnis kecil', popular: true },
  pro:        { badge: 'badge-violet', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: '🚀', tagline: 'Untuk bisnis berkembang' },
  enterprise: { badge: 'badge-green',  color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: '👑', tagline: 'Skala korporasi & multi-cabang' },
}

const getPlanPres = (planKey) => {
  const k = (planKey || '').toLowerCase()
  if (PRESENTATION[k]) return PRESENTATION[k]
  return { badge: 'badge-violet', color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', icon: '✨', tagline: 'Paket Kustom' }
}

const fmt      = v => (v === null || v === undefined || v === '') ? 'Unlimited' : Number(v).toLocaleString('id-ID')
const fmtPrice = v => (!v || Number(v) === 0) ? 'Gratis' : `Rp ${Number(v).toLocaleString('id-ID')}`

// ─── Add / Create Plan Modal ──────────────────────────────────────────────────
function CreatePlanModal({ categorySlug, onClose, onSave, saving }) {
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']
  const [form, setForm] = useState({
    name: '',
    plan_key: '',
    price: 0,
    max_staff: '',
    max_products: '',
    is_active: true,
    features: Object.keys(featureLabels).reduce((acc, k) => ({ ...acc, [k]: false }), {})
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setFeat = (key, val) => setForm(f => ({ ...f, features: { ...f.features, [key]: val } }))

  const handleNameChange = (e) => {
    const val = e.target.value
    const autoKey = val.toLowerCase().replace(/[^a-z0-9]/g, '_')
    setForm(f => ({ ...f, name: val, plan_key: f.plan_key || autoKey }))
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{
          background: 'linear-gradient(135deg,#6366f1,#4f46e5)', padding: '20px 24px', borderRadius: '12px 12px 0 0',
          color: '#ffffff', display: 'flex', alignItems: 'center', gap: 12, margin: '-24px -24px 20px'
        }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff' }}>Tambah Paket Baru</h3>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.9, color: '#ffffff' }}>Konfigurasi paket langganan kustom untuk kategori ini</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="form-label font-semibold">Nama Paket</label>
            <input className="form-input" placeholder="Contoh: Starter VIP, Enterprise" value={form.name} onChange={handleNameChange} required />
          </div>
          <div>
            <label className="form-label font-semibold">ID / Key Paket (Unik)</label>
            <input className="form-input" placeholder="Contoh: enterprise" value={form.plan_key} onChange={e => set('plan_key', e.target.value)} required />
          </div>
          <div>
            <label className="form-label font-semibold">Harga Bulanan (Rp)</label>
            <CurrencyInput
              className="form-input"
              placeholder="0 = Gratis"
              value={form.price}
              onChange={e => set('price', e.target.value === '' ? 0 : Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label font-semibold">Maks. Pegawai / Akun</label>
            <input
              className="form-input" type="number" min={0} placeholder="Kosongkan = Unlimited"
              value={form.max_staff}
              onChange={e => set('max_staff', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label font-semibold">Maks. Produk / Item</label>
            <input
              className="form-input" type="number" min={0} placeholder="Kosongkan = Unlimited"
              value={form.max_products}
              onChange={e => set('max_products', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
              <span className="font-semibold text-slate-700">Paket Langsung Aktif</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="form-label font-semibold m-0">Fitur &amp; Akses Granular</p>
          <button 
            type="button" 
            className="text-xs text-indigo-600 font-medium hover:underline"
            onClick={() => {
              const allChecked = Object.keys(featureLabels).reduce((acc, k) => ({ ...acc, [k]: true }), {})
              setForm(f => ({ ...f, features: allChecked }))
            }}
          >
            Pilih Semua Fitur
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 240, overflowY: 'auto', paddingRight: 4, marginBottom: 20 }}>
          {Object.entries(featureLabels).map(([key, { label, icon }]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12,
              padding: '6px 10px', borderRadius: 6,
              background: form.features?.[key] ? '#eef2ff' : '#f8fafc',
              border: `1px solid ${form.features?.[key] ? '#c7d2fe' : '#e2e8f0'}`,
            }}>
              <input
                type="checkbox"
                checked={!!form.features?.[key]}
                onChange={e => setFeat(key, e.target.checked)}
                style={{ accentColor: '#4f46e5', width: 14, height: 14 }}
              />
              <span>{icon} {label}</span>
            </label>
          ))}
        </div>

        <div className="modal__actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Batal</button>
          <button
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none' }}
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim() || !form.plan_key.trim()}
          >
            {saving ? 'Menyimpan...' : 'Buat Paket Baru'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditPlanModal({ plan, categorySlug, onClose, onSave, saving }) {
  const [form, setForm] = useState({ ...plan })
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']
  const pres = getPlanPres(plan.plan_key)

  const set    = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setFeat = (key, val) => setForm(f => ({ ...f, features: { ...f.features, [key]: val } }))

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="plan-card-header" style={{
          background: pres.gradient, padding: '20px 24px', borderRadius: '12px 12px 0 0',
          color: '#ffffff', display: 'flex', alignItems: 'center', gap: 12, margin: '-24px -24px 20px'
        }}>
          <span style={{ fontSize: 28 }}>{pres.icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff' }}>Edit Paket — {plan.name}</h3>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.9, color: '#ffffff' }}>{pres.tagline}</p>
          </div>
        </div>

        {/* Harga & Batas */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>
          HARGA &amp; BATAS PENGGUNAAN
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="form-label font-semibold">Nama Paket</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="form-label font-semibold">Harga (Rp / bulan)</label>
            <CurrencyInput
              className="form-input"
              placeholder="0 = Gratis"
              value={form.price ?? 0}
              onChange={e => set('price', e.target.value === '' ? 0 : Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label font-semibold">Maks. Pegawai</label>
            <input
              className="form-input" type="number" min={0} placeholder="Unlimited"
              value={form.max_staff ?? ''}
              onChange={e => set('max_staff', e.target.value === '' ? null : Number(e.target.value))}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Kosongkan = Unlimited</p>
          </div>
          <div>
            <label className="form-label font-semibold">Maks. Produk / Item</label>
            <input
              className="form-input" type="number" min={0} placeholder="Unlimited"
              value={form.max_products ?? ''}
              onChange={e => set('max_products', e.target.value === '' ? null : Number(e.target.value))}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Kosongkan = Unlimited</p>
          </div>
        </div>

        {/* Status */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, marginBottom: 16,
          padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)'
        }}>
          <input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16 }} />
          <span className="font-semibold text-slate-700">Paket aktif — ditampilkan ke tenant kategori ini</span>
        </label>

        {/* Fitur Granular */}
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, margin: 0 }}>
            FITUR &amp; PERMISSION GRANULAR
          </p>
          <div className="flex gap-2 text-xs">
            <button 
              type="button" 
              className="text-indigo-600 hover:underline"
              onClick={() => {
                const allTrue = Object.keys(featureLabels).reduce((acc, k) => ({ ...acc, [k]: true }), {})
                setForm(f => ({ ...f, features: allTrue }))
              }}
            >
              Semua Aktif
            </button>
            <span className="text-slate-300">|</span>
            <button 
              type="button" 
              className="text-slate-500 hover:underline"
              onClick={() => {
                const allFalse = Object.keys(featureLabels).reduce((acc, k) => ({ ...acc, [k]: false }), {})
                setForm(f => ({ ...f, features: allFalse }))
              }}
            >
              Kosongkan
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4, marginBottom: 20 }}>
          {Object.entries(featureLabels).map(([key, { label, icon }]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12,
              padding: '6px 10px', borderRadius: 6,
              background: form.features?.[key] ? `${pres.color}12` : 'var(--bg-elevated)',
              border: `1px solid ${form.features?.[key] ? pres.color + '40' : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={!!form.features?.[key]}
                onChange={e => setFeat(key, e.target.checked)}
                style={{ accentColor: pres.color, width: 14, height: 14 }}
              />
              <span>{icon} {label}</span>
            </label>
          ))}
        </div>

        <div className="modal__actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Batal</button>
          <button
            className="btn btn-primary"
            style={{ background: pres.gradient, border: 'none' }}
            onClick={() => onSave(form)}
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, categorySlug, onEdit, onDelete }) {
  const pres = getPlanPres(plan.plan_key)
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']
  const isCustom = !['free', 'basic', 'pro'].includes(plan.plan_key)

  return (
    <div className="card" style={{
      padding: 0, overflow: 'hidden', position: 'relative',
      border: pres.popular ? `2px solid ${pres.color}` : '1px solid var(--border-subtle)',
      opacity: plan.is_active ? 1 : 0.6,
      transition: 'transform 0.18s, box-shadow 0.18s',
    }}>
      {/* Header Banner */}
      <div style={{
        background: pres.gradient, padding: '20px 20px 16px', color: '#ffffff', position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 24 }}>{pres.icon}</span>
            <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#ffffff' }}>{plan.name}</h3>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.9, color: '#ffffff' }}>{pres.tagline}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!plan.is_active && (
              <span className="badge badge-secondary" style={{ fontSize: 10, background: 'rgba(0,0,0,0.3)', color: '#fff' }}>Nonaktif</span>
            )}
            {isCustom && onDelete && (
              <button 
                onClick={() => onDelete(plan.id)}
                className="text-white/70 hover:text-white p-1 rounded hover:bg-white/20 transition-colors"
                title="Hapus Paket Kustom"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Harga */}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
            {fmtPrice(plan.price)}
          </div>
          <span style={{ fontSize: 11, opacity: 0.8, color: '#ffffff' }}>
            {Number(plan.price) === 0 ? 'Gratis selamanya' : 'per tenant / bulan'}
          </span>
        </div>
      </div>

      {/* Limits & Feature list */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Maks. Pegawai</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(plan.max_staff)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Maks. Produk</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(plan.max_products)}</p>
          </div>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
          Fitur Termasuk:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
          {Object.entries(featureLabels).map(([key, { label, icon }]) => {
            const has = !!plan.features?.[key]
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                color: has ? 'var(--text-primary)' : 'var(--text-muted)',
                opacity: has ? 1 : 0.45,
              }}>
                <span style={{ fontSize: 12 }}>{has ? '✓' : '—'}</span>
                <span>{icon} {label}</span>
              </div>
            )
          })}
        </div>

        <button
          className="btn btn-secondary btn-block"
          style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => onEdit(plan)}
        >
          <Edit3 size={14} />
          <span>Edit Konfigurasi Paket</span>
        </button>
      </div>
    </div>
  )
}

// ─── Matrix View ──────────────────────────────────────────────────────────────
function MatrixView({ plans, categorySlug, onEdit }) {
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '35%', background: 'var(--bg-elevated)' }}>Fitur / Kapabilitas</th>
              {plans.map(p => (
                <th key={p.id} style={{ textAlign: 'center', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{fmtPrice(p.price)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Maks. Pegawai</td>
              {plans.map(p => <td key={p.id} style={{ textAlign: 'center', fontWeight: 600 }}>{fmt(p.max_staff)}</td>)}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Maks. Produk</td>
              {plans.map(p => <td key={p.id} style={{ textAlign: 'center', fontWeight: 600 }}>{fmt(p.max_products)}</td>)}
            </tr>
            {Object.entries(featureLabels).map(([key, { label, icon }]) => (
              <tr key={key}>
                <td>{icon} {label}</td>
                {plans.map(p => {
                  const has = !!p.features?.[key]
                  return (
                    <td key={p.id} style={{ textAlign: 'center' }}>
                      {has ? <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 16 }}>✓</span> : <span style={{ color: '#dc2626', opacity: 0.3 }}>✕</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const DEFAULT_CATEGORIES = [
  { slug: 'toko-retail',      name: 'Toko Retail',       icon: '🛒', color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { slug: 'budidaya-hewan',    name: 'Budidaya Hewan',     icon: '🐟', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  { slug: 'jasa',             name: 'Jasa',              icon: '🛠️', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { slug: 'kuliner',          name: 'Kuliner',           icon: '🍽️', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)' },
  { slug: 'seller',           name: 'Seller',            icon: '🌐', color: '#ec4899', gradient: 'linear-gradient(135deg,#ec4899,#be185d)' },
]

export default function PackagesFeatures() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState('toko-retail')
  const [plansByCategory, setPlansByCategory] = useState({}) // cache per slug
  const [loading, setLoading] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeView, setActiveView] = useState('cards')
  const [toast, setToast] = useState(null)
  const [creatingDefaults, setCreatingDefaults] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch master business categories from DB
  useEffect(() => {
    api.get('/categories')
      .then(res => {
        const catList = res.data?.data || []
        if (catList.length > 0) {
          const formatted = catList.map(c => ({
            id: c.id,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: c.name,
            icon: c.icon || '🏢',
            color: c.color || '#3b82f6',
            gradient: `linear-gradient(135deg, ${c.color || '#3b82f6'}, ${c.color ? c.color + 'cc' : '#1d4ed8'})`,
          }))
          setCategories(formatted)
        }
      })
      .catch(err => {
        console.error('Failed to load dynamic categories:', err)
      })
  }, [])

  const categoriesList = categories.length > 0 ? categories : DEFAULT_CATEGORIES

  const fetchPlans = async (slug, force = false) => {
    if (!slug) return
    if (!force && plansByCategory[slug]) return
    setLoading(true)
    try {
      const res = await api.get('/admin/subscription-plans', { params: { category: slug } })
      setPlansByCategory(prev => ({ ...prev, [slug]: res.data }))
    } catch (e) {
      console.error(e)
      showToast('Gagal memuat data paket', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlans(activeCategory) }, [activeCategory])

  const handleCategorySwitch = (slug) => {
    setActiveCategory(slug)
    setEditPlan(null)
  }

  const handleSave = async (updated) => {
    setSaving(true)
    try {
      const res = await api.put(`/admin/subscription-plans/${updated.id}`, {
        name:         updated.name,
        price:        Number(updated.price || 0),
        max_staff:    updated.max_staff === '' ? null : updated.max_staff,
        max_products: updated.max_products === '' ? null : updated.max_products,
        features:     updated.features,
        is_active:    updated.is_active,
      })
      const savedData = res.data.data || res.data
      setPlansByCategory(prev => ({
        ...prev,
        [activeCategory]: prev[activeCategory].map(p => p.id === updated.id ? savedData : p)
      }))
      setEditPlan(null)
      showToast('Paket berhasil disimpan ✓')
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menyimpan perubahan paket', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewPlan = async (newPlanData) => {
    setSaving(true)
    try {
      const payload = {
        category:     activeCategory,
        name:         newPlanData.name,
        plan_key:     newPlanData.plan_key,
        price:        Number(newPlanData.price || 0),
        max_staff:    newPlanData.max_staff === '' ? null : newPlanData.max_staff,
        max_products: newPlanData.max_products === '' ? null : newPlanData.max_products,
        features:     newPlanData.features,
        is_active:    newPlanData.is_active,
      }
      const res = await api.post('/admin/subscription-plans', payload)
      const createdPlan = res.data.data || res.data
      setPlansByCategory(prev => ({
        ...prev,
        [activeCategory]: [...(prev[activeCategory] || []), createdPlan]
      }))
      setShowCreateModal(false)
      showToast('Paket baru berhasil ditambahkan! 🎉')
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal membuat paket baru', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Yakin ingin menghapus paket ini? Tenant yang saat ini menggunakan paket ini disarankan dipindahkan terlebih dahulu.')) return
    try {
      await api.delete(`/admin/subscription-plans/${planId}`)
      setPlansByCategory(prev => ({
        ...prev,
        [activeCategory]: prev[activeCategory].filter(p => p.id !== planId)
      }))
      showToast('Paket berhasil dihapus ✓')
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menghapus paket', 'error')
    }
  }

  const handleCreateDefaults = async () => {
    setCreatingDefaults(true)
    try {
      const res = await api.post('/admin/subscription-plans/defaults', { category: activeCategory })
      setPlansByCategory(prev => ({ ...prev, [activeCategory]: res.data }))
      showToast('Paket Free/Basic/Pro berhasil dibuat ✓')
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal membuat paket default', 'error')
    } finally {
      setCreatingDefaults(false)
    }
  }

  const plans = plansByCategory[activeCategory] || []
  const activeCat = categoriesList.find(c => c.slug === activeCategory) || categoriesList[0] || DEFAULT_CATEGORIES[0]

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header mb-2">
        <h2 className="page-title">Paket &amp; Fitur Langganan</h2>
      </div>

      {/* ── Action Button below title, aligned to the right ── */}
      <div className="flex justify-end mb-4">
        <button 
          className="btn btn-primary flex items-center gap-1.5"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categoriesList.map(cat => {
            const isActive = activeCategory === cat.slug
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategorySwitch(cat.slug)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                  transition: 'all 0.18s',
                  background: isActive ? cat.gradient : 'var(--bg-elevated)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isActive ? `0 4px 14px ${cat.color}40` : 'none',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
              >
                <span style={{ fontSize: 15 }}>{cat.icon}</span>
                <span>{cat.name}</span>
                {plansByCategory[cat.slug] && (
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    borderRadius: 99, fontSize: 11, fontWeight: 600,
                    padding: '1px 6px', minWidth: 18, textAlign: 'center'
                  }}>
                    {plansByCategory[cat.slug].length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeView === 'cards' ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveView('cards')}
          >📦 Kartu Paket</button>
          <button
            className={`filter-tab ${activeView === 'matrix' ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveView('matrix')}
          >📋 Matriks Fitur</button>
        </div>
      </div>

      {/* Category Banner */}
      <div style={{
        background: activeCat.gradient, borderRadius: 14, padding: '16px 20px',
        color: '#fff', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 36 }}>{activeCat.icon}</span>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, opacity: 0.75, letterSpacing: 1 }}>KATEGORI SEKTOR AKTIF</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{activeCat.name}</p>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            {plans.length} paket langganan aktif dikonfigurasi · Setting hak akses &amp; limit kuota berlaku otomatis ke seluruh tenant kategori ini.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14 }}>Menyinkronkan konfigurasi paket...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && plans.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          background: 'var(--bg-elevated)', borderRadius: 14,
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>Belum ada paket untuk {activeCat.name}</p>
          <p style={{ fontSize: 13, marginTop: 6, marginBottom: 20 }}>Buat paket default Free/Basic/Pro atau tambahkan paket kustom baru.</p>
          <div className="flex justify-center gap-3">
            <button
              className="btn btn-primary"
              style={{ background: activeCat.gradient, border: 'none' }}
              onClick={handleCreateDefaults}
              disabled={creatingDefaults}
            >
              {creatingDefaults ? 'Membuat...' : `✨ Buat Paket Bawaan`}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(true)}
            >
              + Tambah Paket Kustom
            </button>
          </div>
        </div>
      )}

      {/* CARDS VIEW */}
      {!loading && plans.length > 0 && activeView === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              categorySlug={activeCategory}
              onEdit={setEditPlan}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      )}

      {/* MATRIX VIEW */}
      {!loading && plans.length > 0 && activeView === 'matrix' && (
        <MatrixView
          plans={plans}
          categorySlug={activeCategory}
          onEdit={setEditPlan}
        />
      )}

      {/* ── Edit Modal ── */}
      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          categorySlug={activeCategory}
          onClose={() => !saving && setEditPlan(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  )
}
