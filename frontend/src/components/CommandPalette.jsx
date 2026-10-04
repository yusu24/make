import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Search,
  Store,
  Users,
  CreditCard,
  Radio,
  FileText,
  Shield,
  Settings,
  Database,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
  KeyRound,
  Eye,
  AlertTriangle,
  Zap,
  Activity,
  Package,
  Layers,
  HelpCircle,
  X
} from '@/constants/icons'

const SAAS_COMMANDS = [
  // Navigations
  { id: 'nav-dash', category: 'Navigasi Menu', title: 'Dashboard Executive SaaS', subtitle: 'MRR, ARR, Churn, Tenant Health', icon: Activity, path: '/dashboard', color: '#4f46e5' },
  { id: 'nav-tenants', category: 'Navigasi Menu', title: 'Manajemen Tenant', subtitle: 'Daftar semua merchant & toko', icon: Store, path: '/tenants', color: '#0284c7' },
  { id: 'nav-subs', category: 'Navigasi Menu', title: 'Langganan & Billing', subtitle: 'Siklus langganan, invoice & paket', icon: CreditCard, path: '/subscriptions', color: '#10b981' },
  { id: 'nav-broadcast', category: 'Navigasi Menu', title: 'Broadcast & Push Notification', subtitle: 'Siaran pengumuman ke dashboard merchant', icon: Radio, path: '/content-announcement', color: '#f59e0b' },
  { id: 'nav-kyc', category: 'Navigasi Menu', title: 'Verifikasi KYC Merchant', subtitle: 'Validasi dokumen & identitas bisnis', icon: Shield, path: '/kyc', color: '#8b5cf6' },
  { id: 'nav-finance', category: 'Navigasi Menu', title: 'Laporan Keuangan SaaS', subtitle: 'Cash flow, laba rugi & transaksi', icon: FileText, path: '/finance', color: '#10b981' },
  { id: 'nav-packages', category: 'Navigasi Menu', title: 'Paket & Fitur Modul', subtitle: 'Konfigurasi paket Free, Pro, Enterprise', icon: Package, path: '/packages-features', color: '#6366f1' },
  { id: 'nav-backup', category: 'Navigasi Menu', title: 'Database Backup & Restore', subtitle: 'Pencadangan database otomatis & manual', icon: Database, path: '/backups', color: '#64748b' },
  { id: 'nav-dev', category: 'Navigasi Menu', title: 'Developer & Webhook API', subtitle: 'API keys, webhook events, logging', icon: Zap, path: '/developer-integrations', color: '#06b6d4' },
  { id: 'nav-settings', category: 'Navigasi Menu', title: 'Pengaturan Landing & Hero', subtitle: 'Konfigurasi landing page publik', icon: Settings, path: '/landing-settings', color: '#64748b' },

  // Quick Action Shortcuts
  { id: 'act-add-tenant', category: 'Aksi Cepat', title: 'Tambah Tenant Baru', subtitle: 'Daftarkan bisnis baru ke sistem', icon: Plus, path: '/tenants', color: '#4f46e5' },
  { id: 'act-new-broadcast', category: 'Aksi Cepat', title: 'Kirim Siaran Broadcast Baru', subtitle: 'Buat notifikasi modal / banner untuk merchant', icon: Radio, path: '/content-announcement', color: '#f59e0b' },
  { id: 'act-filter-risk', category: 'Aksi Cepat', title: 'Filter Tenant Berisiko Churn', subtitle: 'Lihat tenant dengan health score < 40', icon: AlertTriangle, path: '/tenants?health_status=at_risk', color: '#ef4444' },
  { id: 'act-filter-warning', category: 'Aksi Cepat', title: 'Filter Tenant Butuh Perhatian', subtitle: 'Lihat tenant dengan health score 40-69', icon: Activity, path: '/tenants?health_status=warning', color: '#f59e0b' },
]

const getSellerRetailCommands = (isSeller) => {
  const base = isSeller ? '/seller' : '/retail'
  return [
    // Aksi Cepat
    { id: 'act-pos', category: 'Aksi Cepat & Kasir', title: 'Kasir POS (Toko Offline)', subtitle: 'Buka register kasir dan transaksi penjualan langsung', icon: CreditCard, path: `${base}/pos`, color: '#10b981' },
    { id: 'act-new-prod', category: 'Aksi Cepat & Kasir', title: 'Tambah Produk Baru', subtitle: 'Input data produk, SKU, variasi, dan harga jual', icon: Plus, path: `${base}/products`, color: '#4f46e5' },
    { id: 'act-connect-api', category: 'Aksi Cepat & Kasir', title: 'Hubungkan API Marketplace Baru', subtitle: 'Input kredensial Partner ID & Key Shopee, Tokopedia, TikTok', icon: Zap, path: isSeller ? '/seller/marketplace/connected' : '/retail/settings', color: '#f59e0b' },
    { id: 'act-sync-stock', category: 'Aksi Cepat & Kasir', title: 'Sinkronisasi Stok Real-Time', subtitle: 'Picu sinkronisasi stok e-commerce dan marketplace', icon: Sparkles, path: isSeller ? '/seller/marketplace/sync' : '/retail/inventory', color: '#6366f1' },
    { id: 'act-master-data', category: 'Aksi Cepat & Kasir', title: 'Master Data Terpadu & Import Excel', subtitle: 'Kelola kategori, satuan, batch, serial, dan import data massal', icon: FileText, path: isSeller ? '/seller/master-data' : '/retail/setup-master-data', color: '#0284c7' },

    // E-Commerce & Omnichannel
    { id: 'nav-orders', category: 'Pesanan & Marketplace', title: 'Manajemen Pesanan E-Commerce', subtitle: 'Pesanan masuk dari Shopee, Tokopedia, TikTok Shop & POS', icon: Package, path: isSeller ? '/seller/orders' : '/retail/transactions', color: '#0284c7' },
    { id: 'nav-connected', category: 'Pesanan & Marketplace', title: 'Toko Terhubung & API Marketplace', subtitle: 'Status koneksi API Shopee, Tokopedia, TikTok Shop, Lazada', icon: Zap, path: isSeller ? '/seller/marketplace/connected' : '/retail/settings', color: '#f59e0b' },
    { id: 'nav-shipping-pack', category: 'Pesanan & Marketplace', title: 'Packing Station & Cetak AWB', subtitle: 'Proses pengemasan dan cetak resi pengiriman kurir', icon: Package, path: isSeller ? '/seller/shipping/packing' : '/retail/transactions', color: '#8b5cf6' },
    { id: 'nav-sync-hub', category: 'Pesanan & Marketplace', title: 'Pusat Sinkronisasi Stok', subtitle: 'Status sinkronisasi real-time dan log error API', icon: Sparkles, path: isSeller ? '/seller/marketplace/sync' : '/retail/inventory', color: '#6366f1' },
    { id: 'nav-shipping-mgmt', category: 'Pesanan & Marketplace', title: 'Manajemen Ekspedisi & Kurir', subtitle: 'Konfigurasi kurir pengiriman toko dan ongkos kirim', icon: Package, path: isSeller ? '/seller/shipping/management' : '/retail/settings', color: '#0284c7' },

    // Katalog & Stok
    { id: 'nav-products', category: 'Katalog & Inventori', title: 'Katalog Produk & Daftar Barang', subtitle: 'Daftar semua produk, variasi, stok fisik dan harga jual', icon: Layers, path: `${base}/products`, color: '#10b981' },
    { id: 'nav-inventory', category: 'Katalog & Inventori', title: 'Stok Barang & Multi-Gudang', subtitle: 'Pantau ketersediaan stok, batas minimum, dan mutasi barang', icon: Database, path: `${base}/inventory`, color: '#06b6d4' },
    { id: 'nav-units', category: 'Katalog & Inventori', title: 'Satuan Ukur Barang (Unit)', subtitle: 'Standarisasi unit Pcs, Box, Dus, Kg, Botol, Pack, Lusin', icon: Layers, path: `${base}/units`, color: '#6366f1' },
    { id: 'nav-categories', category: 'Katalog & Inventori', title: 'Kategori Produk', subtitle: 'Struktur pengelompokan katalog barang toko', icon: Layers, path: `${base}/categories`, color: '#10b981' },
    { id: 'nav-batches', category: 'Katalog & Inventori', title: 'Batch & Tanggal Kadaluwarsa (ED)', subtitle: 'Pelacakan nomor batch dan expired date barang', icon: AlertTriangle, path: `${base}/batches`, color: '#f59e0b' },
    { id: 'nav-serials', category: 'Katalog & Inventori', title: 'Serial Number & IMEI', subtitle: 'Manajemen nomor seri unik barang elektronik/gadget', icon: KeyRound, path: `${base}/serials`, color: '#8b5cf6' },
    { id: 'nav-labels', category: 'Katalog & Inventori', title: 'Cetak Barcode & Label Harga', subtitle: 'Cetak label barcode untuk rak toko dan kemasan', icon: FileText, path: `${base}/print-labels`, color: '#64748b' },
    { id: 'nav-discounts', category: 'Katalog & Inventori', title: 'Diskon & Promo Penjualan', subtitle: 'Kupon potongan harga, diskon persentase, dan voucher', icon: Zap, path: `${base}/discounts`, color: '#ef4444' },
    { id: 'nav-pricelists', category: 'Katalog & Inventori', title: 'Harga Grosir & Member', subtitle: 'Tingkatan harga khusus reseller dan pelanggan VIP', icon: CreditCard, path: `${base}/pricelists`, color: '#0284c7' },

    // Finansial & Laporan
    { id: 'nav-rep-sales', category: 'Laporan & Finansial', title: 'Laporan Penjualan', subtitle: 'Grafik omzet, tren transaksi, dan laporan kasir', icon: FileText, path: isSeller ? '/seller/reports/sales' : '/retail/reports/sales', color: '#10b981' },
    { id: 'nav-rep-summary', category: 'Laporan & Finansial', title: 'Ringkasan Laba Rugi', subtitle: 'Perhitungan pendapatan bersih, HPP, dan pengeluaran', icon: FileText, path: isSeller ? '/seller/reports' : '/retail/finance/summary', color: '#10b981' },
    { id: 'nav-rep-margins', category: 'Laporan & Finansial', title: 'Laporan Margin Keuntungan', subtitle: 'Persentase margin profit per kategori dan item', icon: Activity, path: isSeller ? '/seller/reports/margins' : '/retail/reports/margins', color: '#6366f1' },
    { id: 'nav-customers', category: 'Laporan & Finansial', title: 'Data Pelanggan (CRM)', subtitle: 'Database pembeli, nomor WhatsApp, dan poin loyalitas', icon: Users, path: `${base}/customers`, color: '#4f46e5' },
    { id: 'nav-suppliers', category: 'Laporan & Finansial', title: 'Data Supplier & Pemasok', subtitle: 'Daftar vendor, distributor, dan kontak pembelian', icon: Store, path: `${base}/suppliers`, color: '#64748b' },

    // Panduan & Bantuan
    { id: 'nav-guide', category: 'Bantuan & Pengaturan', title: 'Buku Panduan & SOP Seller', subtitle: 'Panduan lengkap cara pakai fitur dan integrasi marketplace', icon: HelpCircle, path: `${base}/guide`, color: '#64748b' },
    { id: 'nav-dev-api', category: 'Bantuan & Pengaturan', title: 'Integrasi API & Webhook', subtitle: 'Dokumentasi REST API dan webhook otomatis', icon: Zap, path: isSeller ? '/seller/developer-api' : '/retail/developer-api', color: '#06b6d4' },
    { id: 'nav-settings', category: 'Bantuan & Pengaturan', title: 'Pengaturan Toko & Akun', subtitle: 'Profil toko, logo, alamat, dan preferensi aplikasi', icon: Settings, path: isSeller ? '/seller/settings' : '/retail/settings', color: '#64748b' },
  ]
}

export default function CommandPalette({ isOpen, onClose, onSelectTenant }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { impersonate, isSuperAdmin, user } = useAuth()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tenantResults, setTenantResults] = useState([])
  const [searchingTenants, setSearchingTenants] = useState(false)
  const [productResults, setProductResults] = useState([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const inputRef = useRef(null)

  const isSeller = location.pathname.startsWith('/seller')
  const isRetail = location.pathname.startsWith('/retail')
  const isKuliner = location.pathname.startsWith('/kuliner')
  const isSaasAdmin = !isRetail && !isSeller && !isKuliner && (isSuperAdmin?.() || user?.role === 'admin')

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setProductResults([])
      setTenantResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Search live tenants (for SaaS admin) or live products (for Seller/Retail)
  useEffect(() => {
    if (!isOpen || !query.trim() || query.trim().length < 2) {
      setTenantResults([])
      setSearchingTenants(false)
      setProductResults([])
      setSearchingProducts(false)
      return
    }

    let isMounted = true

    if (isSaasAdmin) {
      setSearchingTenants(true)
      const timer = setTimeout(async () => {
        try {
          const res = await api.get('/admin/tenants')
          if (!isMounted) return
          const all = res.data?.data || []
          const q = query.toLowerCase()
          const matches = all.filter(t => 
            (t.name || '').toLowerCase().includes(q) ||
            (t.tenant_id || '').toLowerCase().includes(q) ||
            (t.email || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q)
          ).slice(0, 5)
          setTenantResults(matches)
        } catch (err) {
          console.error('Tenant search error:', err)
        } finally {
          if (isMounted) setSearchingTenants(false)
        }
      }, 200)

      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    } else {
      // Search products for Seller Retail
      setSearchingProducts(true)
      const timer = setTimeout(async () => {
        try {
          const res = await api.get('/retail/products')
          if (!isMounted) return
          const all = res.data?.data || []
          const q = query.toLowerCase()
          const matches = all.filter(p => 
            (p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.barcode || '').toLowerCase().includes(q)
          ).slice(0, 5)
          setProductResults(matches)
        } catch (err) {
          // safe fallback
        } finally {
          if (isMounted) setSearchingProducts(false)
        }
      }, 200)

      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }
  }, [query, isOpen, isSaasAdmin])

  const availableCommands = isSaasAdmin ? SAAS_COMMANDS : getSellerRetailCommands(isSeller)

  // Filter static items
  const filteredCommands = availableCommands.filter(cmd => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return cmd.title.toLowerCase().includes(q) || 
           cmd.subtitle.toLowerCase().includes(q) ||
           cmd.category.toLowerCase().includes(q)
  })

  // Group all visible items for keyboard navigation
  const allItems = [
    ...tenantResults.map(t => ({ type: 'tenant', data: t })),
    ...productResults.map(p => ({ type: 'product', data: p })),
    ...filteredCommands.map(c => ({ type: 'command', data: c })),
  ]

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (allItems.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (allItems[selectedIndex]) {
          handleExecute(allItems[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, allItems])

  const handleExecute = (item) => {
    if (!item) return
    onClose()

    if (item.type === 'tenant') {
      const t = item.data
      if (onSelectTenant) {
        onSelectTenant(t)
      } else {
        navigate(`/tenants?search=${t.tenant_id}`)
      }
    } else if (item.type === 'product') {
      const p = item.data
      const target = isSeller ? `/seller/products?search=${encodeURIComponent(p.name)}` : `/retail/products?search=${encodeURIComponent(p.name)}`
      navigate(target)
    } else if (item.type === 'command') {
      const cmd = item.data
      if (cmd.path) {
        navigate(cmd.path)
      }
    }
  }

  const handleImpersonateTenant = async (e, tenant) => {
    e.stopPropagation()
    onClose()
    try {
      const redirect = await impersonate(tenant.tenant_id)
      navigate(redirect || '/retail/dashboard')
    } catch (err) {
      alert('Gagal login sebagai tenant: ' + (err.response?.data?.message || err.message))
    }
  }

  if (!isOpen) return null

  const categoryIconMap = {
    'Aksi Cepat': '⚡ ',
    'Aksi Cepat & Kasir': '⚡ ',
    'Navigasi Menu': '🧭 ',
    'Pesanan & Marketplace': '📦 ',
    'Katalog & Inventori': '🏷️ ',
    'Laporan & Finansial': '💰 ',
    'Bantuan & Pengaturan': '⚙️ ',
  }

  const uniqueCategories = Array.from(new Set(filteredCommands.map(c => c.category)))

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'scaleUp 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={isSeller || isRetail ? "Cari menu pintasan, aksi cepat, atau produk... (Ketik atau pilih)" : "Cari tenant, halaman SaaS, fitur, aksi cepat... (Ketik atau pilih)"}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: 500,
              color: '#1e293b',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            background: '#e2e8f0',
            color: '#64748b',
            padding: '2px 8px',
            borderRadius: 9999,
            fontFamily: 'monospace'
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {/* Tenant Live Results (For SaaS Admin) */}
          {tenantResults.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ padding: '6px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                🏢 Hasil Pencarian Tenant
              </div>
              {tenantResults.map((t, idx) => {
                const isSelected = selectedIndex === idx
                return (
                  <div
                    key={t.tenant_id}
                    onClick={() => handleExecute({ type: 'tenant', data: t })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: isSelected ? '#f1f5f9' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: '#e0e7ff', color: '#4338ca',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12
                      }}>
                        {t.name ? t.name.slice(0, 2).toUpperCase() : 'TN'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>
                          <code>{t.tenant_id}</code> • {t.category || 'Retail'} • <span className="font-semibold">{t.subscription_plan || t.plan || 'Free'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={(e) => handleImpersonateTenant(e, t)}
                        style={{
                          background: '#eef2ff',
                          color: '#4f46e5',
                          border: '1px solid #c7d2fe',
                          padding: '4px 10px',
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title={`Login sebagai ${t.name}`}
                      >
                        <KeyRound size={11} /> Login
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Product Live Results (For Retail & Seller) */}
          {productResults.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ padding: '6px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                📦 Hasil Pencarian Produk & Katalog
              </div>
              {productResults.map((p, idx) => {
                const globalIdx = tenantResults.length + idx
                const isSelected = selectedIndex === globalIdx
                return (
                  <div
                    key={p.id || idx}
                    onClick={() => handleExecute({ type: 'product', data: p })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: isSelected ? '#f1f5f9' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: '#ecfdf5', color: '#059669',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14
                      }}>
                        <Package size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>
                          SKU: <code style={{ fontFamily: 'monospace' }}>{p.sku || '-'}</code> • <span style={{ fontWeight: 600, color: '#059669' }}>Rp {Number(p.price || 0).toLocaleString('id-ID')}</span> • Stok: <span style={{ fontWeight: 600 }}>{p.stock ?? '-'}</span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight size={14} className={isSelected ? 'text-indigo-600' : 'text-slate-300'} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Commands Grouped by Category */}
          {filteredCommands.length > 0 && (
            <div>
              {uniqueCategories.map(cat => {
                const itemsInCat = filteredCommands.filter(c => c.category === cat)
                if (itemsInCat.length === 0) return null

                return (
                  <div key={cat} style={{ marginBottom: 6 }}>
                    <div style={{ padding: '6px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                      {categoryIconMap[cat] || '🧭 '}{cat}
                    </div>
                    {itemsInCat.map(cmd => {
                      const itemIdx = allItems.findIndex(i => i.type === 'command' && i.data.id === cmd.id)
                      const isSelected = selectedIndex === itemIdx
                      const IconComponent = cmd.icon

                      return (
                        <div
                          key={cmd.id}
                          onClick={() => handleExecute({ type: 'command', data: cmd })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 20px',
                            cursor: 'pointer',
                            background: isSelected ? '#f1f5f9' : 'transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: cmd.color + '15',
                              color: cmd.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <IconComponent size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                                {cmd.title}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                {cmd.subtitle}
                              </div>
                            </div>
                          </div>

                          <ArrowRight size={14} className={isSelected ? 'text-indigo-600' : 'text-slate-300'} />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Tidak ada perintah atau tenant yang sesuai dengan kata kunci "<strong>{query}</strong>".
            </div>
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: 11.5,
          color: '#64748b',
        }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>↑</kbd> <kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>↓</kbd> Navigasi</span>
            <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>↵</kbd> Buka</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={12} className="text-indigo-600" />
            <span>Bizora Command Hub</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}