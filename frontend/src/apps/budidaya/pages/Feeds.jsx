import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Package, Plus, Search, Trash2, ArrowUpCircle, AlertCircle, ShoppingBag, ChevronRight, MoreVertical, Pencil, Layers, Database, Filter, ArrowRight, TrendingDown, TrendingUp, Info } from '@/constants/icons'
import Modal from '../../../components/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton } from '../components/UXComponents'
import usePagination from '../../../hooks/usePagination'
import BudidayaPagination from '../components/BudidayaPagination'

export default function Feeds() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [restockModalOpen, setRestockModalOpen] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState(null)
  
  const [formData, setFormData] = useState({ name: '', stock_kg: '' })
  const [restockAmount, setRestockAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/feeds')
      setFeeds(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (selectedFeed) {
        await api.put(`/budidaya/feeds/${selectedFeed.id}`, formData)
      } else {
        await api.post('/budidaya/feeds', formData)
      }
      setModalOpen(false)
      setFormData({ name: '', stock_kg: '' })
      fetchFeeds()
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan pakan')
    } finally {
      setSaving(false)
    }
  }

  const handleRestock = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/budidaya/feeds/${selectedFeed.id}/add`, { add_kg: restockAmount })
      setRestockModalOpen(false)
      setRestockAmount('')
      fetchFeeds()
    } catch (err) {
      console.error(err)
      alert('Gagal tambah stok')
    } finally {
      setSaving(false)
    }
  }

  const filteredFeeds = feeds.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredFeeds)

  const totalStok = feeds.reduce((acc, f) => acc + Number(f.stock_kg), 0)
  const lowStockCount = feeds.filter(f => Number(f.stock_kg) < 50).length

  return (
    <div className="aq-container">
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => { setSelectedFeed(null); setFormData({ name: '', stock_kg: '' }); setModalOpen(true); }}
          style={{ height: '38px', borderRadius: '12px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span>Registrasi Pakan</span>
        </button>
      </div>

      {/* Premium KPI Section */}
      <div className="premium-feed-summary stagger">
        <div className="premium-card kpi-highlight-box primary">
           <div className="kpi-icon-wrapper"><Database size={24} /></div>
           <div className="kpi-info">
              <span className="label">Total Kapasitas Pakan</span>
              <span className="value">{totalStok.toLocaleString()} <small>KG</small></span>
           </div>
           <div className="kpi-trend positive"><TrendingUp size={14} /> Stok Aman</div>
        </div>

        <div className={`premium-card kpi-highlight-box ${lowStockCount > 0 ? 'danger' : 'success'}`}>
           <div className="kpi-icon-wrapper">{lowStockCount > 0 ? <AlertCircle size={24} /> : <Layers size={24} />}</div>
           <div className="kpi-info">
              <span className="label">Status Kritis</span>
              <span className="value">{lowStockCount} <small>Merk</small></span>
           </div>
           <div className="kpi-trend">{lowStockCount > 0 ? 'Perlu Restok' : 'Optimal'}</div>
        </div>

        <div className="premium-card kpi-highlight-box info">
           <div className="kpi-icon-wrapper"><ShoppingBag size={24} /></div>
           <div className="kpi-info">
              <span className="label">Varian Merk Aktif</span>
              <span className="value">{feeds.length} <small>Jenis</small></span>
           </div>
           <div className="kpi-trend neutral">Aktif</div>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="premium-card board-container animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="board-header">
           <div className="search-box-premium">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Cari Merk atau Nama Pakan..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="board-actions">
              <button className="btn btn-icon btn-secondary"><Filter size={18} /></button>
              <button className="btn btn-icon btn-secondary"><MoreVertical size={18} /></button>
           </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Menyinkronkan data gudang...</p>
          </div>
        ) : filteredFeeds.length === 0 ? (
          <div className="empty-state-premium">
             <div className="empty-icon-wrap">
                <ShoppingBag size={64} style={{ opacity: 0.1 }} />
             </div>
             <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Gudang Logistik Kosong</h3>
             <p className="text-secondary mb-6">Belum ada data pakan yang terdaftar di sistem.</p>
             <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>Daftar Pakan Pertama</button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell className="pl-6">Nama / Merk Pakan</TableHeaderCell>
                  <TableHeaderCell>Estimasi Stok</TableHeaderCell>
                  <TableHeaderCell>Kategori Status</TableHeaderCell>
                  <TableHeaderCell className="pr-6" style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((feed, idx) => {
                  const isLow = Number(feed.stock_kg) < 50;
                  return (
                    <TableRow key={feed.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-6">
                        <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 600 }}>{feed.name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="stock-visual-bar">
                          <div className="visual-header">
                             <span className="v-val">{Number(feed.stock_kg).toLocaleString()} <small>KG</small></span>
                             <span className="v-perc">{Math.min(Math.round((feed.stock_kg / 500) * 100), 100)}%</span>
                          </div>
                          <div className="v-progress-bg">
                             <div className={`v-progress-fill ${isLow ? 'is-low' : 'is-safe'}`} style={{ width: `${Math.min((feed.stock_kg / 500) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isLow ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {isLow ? 'Stok Menipis' : 'Tersedia'}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6" style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" onClick={() => { setSelectedFeed(feed); setRestockModalOpen(true); }} title="Restok Pakan">
                             <ArrowUpCircle size={14} />
                          </button>
                          <button className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" onClick={() => { setSelectedFeed(feed); setFormData({ name: feed.name, stock_kg: feed.stock_kg }); setModalOpen(true); }} title="Edit Data">
                            <Pencil size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <BudidayaPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </>
        )}
      </div>

      {/* Styled Modals */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedFeed ? "Update Data Pakan" : "Tambah Logistik Baru"}>
        <form onSubmit={handleSubmit} className="premium-form-fluid">
           <div className="form-group mb-6">
              <label className="premium-label">IDENTITAS MERK PAKAN</label>
              <div className="premium-input-wrapper">
                 <Package className="field-icon" size={18} />
                 <input type="text" required placeholder="E.g. Cargill 781-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
           </div>
           <div className="form-group mb-8">
              <label className="premium-label">KUANTITAS AWAL (KG)</label>
              <div className="premium-input-wrapper">
                 <Database className="field-icon" size={18} />
                 <input type="number" step="any" required placeholder="0.00" value={formData.stock_kg} onChange={e => setFormData({...formData, stock_kg: e.target.value})} />
              </div>
           </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="btn btn-secondary flex-1" onClick={() => setModalOpen(false)}>Batalkan</button>
              <LoadingButton loading={saving} type="submit" className="btn btn-primary flex-2">Simpan Logistik</LoadingButton>
            </div>
        </form>
      </Modal>

      <Modal isOpen={restockModalOpen} onClose={() => setRestockModalOpen(false)} title="Update Persediaan Pakan">
        <form onSubmit={handleRestock} className="premium-form-fluid">
           {selectedFeed && (
             <div className="selection-info-banner">
                <div className="banner-icon-box"><TrendingUp size={20} /></div>
                <div className="banner-details">
                   <h4 className="b-title">{selectedFeed.name}</h4>
                   <p className="b-sub">Saldo Gudang: <strong>{selectedFeed.stock_kg} KG</strong></p>
                </div>
             </div>
           )}
           <div className="form-group mb-8">
              <label className="premium-label">TAMBAH KUANTITAS (KG)</label>
              <div className="premium-input-wrapper accent-box">
                 <ArrowUpCircle className="field-icon" size={18} />
                 <input type="number" step="any" required autoFocus placeholder="Masukkan angka penambahan..." value={restockAmount} onChange={(e) => setRestockAmount(e.target.value)} />
              </div>
           </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" className="btn btn-secondary flex-1" onClick={() => setRestockModalOpen(false)}>Tutup</button>
              <LoadingButton loading={saving} type="submit" className="btn btn-primary flex-2">Konfirmasi Stok</LoadingButton>
            </div>
        </form>
      </Modal>

      <style>{`
        .header-context-box { display: flex; align-items: center; gap: 20px; }
        .premium-icon-badge { 
           width: 56px; height: 56px; border-radius: 18px; 
           background: linear-gradient(135deg, var(--success-500), var(--primary-600)); 
           color: white; display: flex; align-items: center; justify-content: center; 
           position: relative; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
        }
        .badge-glow { position: absolute; inset: -4px; background: inherit; filter: blur(10px); opacity: 0.3; z-index: -1; }

        .premium-feed-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .kpi-highlight-box { 
           position: relative; overflow: hidden; display: flex; align-items: center; gap: 18px; padding: 20px !important; 
           background: #ffffff !important; border-radius: 16px !important; border: 1px solid #E2E8F0 !important;
           box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05) !important; transition: all 0.2s;
        }
        .kpi-highlight-box:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important; }
        .kpi-highlight-box.primary { border-left: 4px solid #059669 !important; }
        .kpi-highlight-box.danger { border-left: 4px solid #DC2626 !important; }
        .kpi-highlight-box.success { border-left: 4px solid #059669 !important; }
        .kpi-highlight-box.info { border-left: 4px solid #2563EB !important; }

        .kpi-icon-wrapper { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #F8FAFC; color: #64748B; flex-shrink: 0; }
        .primary .kpi-icon-wrapper { background: #ECFDF5; color: #059669; }
        .danger .kpi-icon-wrapper { background: #FEF2F2; color: #DC2626; }
        .success .kpi-icon-wrapper { background: #ECFDF5; color: #059669; }
        .info .kpi-icon-wrapper { background: #EFF6FF; color: #2563EB; }

        .kpi-info .label { display: block; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .kpi-info .value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
        .kpi-info .value small { font-size: 13px; font-weight: 600; color: #64748B; }
        .kpi-trend { position: absolute; top: 16px; right: 16px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 9999px; background: #F1F5F9; color: #64748B; }
        .positive { color: #059669; background: #ECFDF5; }

        .board-container { border-radius: 16px !important; border: 1px solid #E2E8F0 !important; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05) !important; background: #ffffff !important; }
        .board-header { padding: 24px 32px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); }
        .search-box-premium { position: relative; width: 400px; display: flex; align-items: center; gap: 12px; background: var(--bg-elevated); padding: 12px 20px; border-radius: 16px; border: 1px solid var(--border-subtle); transition: 0.2s; }
        .search-box-premium input { background: transparent; border: none; outline: none; width: 100%; font-weight: 600; font-size: 14px; color: var(--text-primary); }
        .search-box-premium input::placeholder { color: var(--text-muted); }
        .search-icon { color: var(--text-muted); }
        .search-box-premium:focus-within { border-color: var(--primary-500); background: var(--bg-card); box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }

        .loading-state-premium { padding: 100px 0; text-align: center; }
        .spinner-glow { width: 50px; height: 50px; border-radius: 50%; border: 4px solid var(--primary-50); border-top-color: var(--primary-500); animation: spin 1s linear infinite; margin: 0 auto 20px; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
        .loading-text { font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; }

        .feed-identity-row { display: flex; align-items: center; gap: 18px; }
        .feed-icon-square { width: 44px; height: 44px; border-radius: 12px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.3s; }
        .f-name { display: block; font-size: 13px; color: var(--text-primary); letter-spacing: -0.01em; margin-bottom: 2px; }
        .f-id { font-size: 11px; color: var(--text-muted); font-family: monospace; }
        tr:hover .feed-icon-square { background: var(--primary-500); color: white; transform: rotate(5deg); }

        .stock-visual-bar { width: 240px; }
        .visual-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
        .v-val { font-size: 13.5px; color: var(--text-primary); }
        .v-val small { font-size: 12px; color: var(--text-muted); }
        .v-perc { font-size: 11.5px; color: var(--text-muted); }
        .v-progress-bg { height: 10px; background: var(--bg-elevated); border-radius: 20px; overflow: hidden; position: relative; }
        .v-progress-fill { height: 100%; border-radius: 20px; transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
        .v-progress-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 2s infinite; }
        .v-progress-fill.is-safe { background: linear-gradient(90deg, #10b981, #34d399); }
        .v-progress-fill.is-low { background: linear-gradient(90deg, #ef4444, #f87171); box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }

        .status-pill { display: inline-flex; align-items: center; gap: 10px; padding: 6px 16px; border-radius: 40px; font-size: 12px; font-weight: 600; }
        .status-pill.success { background: var(--success-50); color: var(--success-600); }
        .status-pill.danger { background: var(--danger-50); color: var(--danger-500); border: 1px solid var(--danger-100); }
        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .status-pill.danger .pulse-dot { animation: pulse 1.5s infinite; }

        .table-row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .btn-primary-alt { background: var(--primary-50); color: var(--primary-600); border: 1px solid var(--primary-100); font-weight: 600; border-radius: 12px !important; }
        .btn-primary-alt:hover { background: var(--primary-600); color: white; transform: translateY(-2px); }
        .btn-icon-more { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-elevated); border: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-icon-more:hover { background: var(--primary-500); color: white; }

        .premium-form-fluid .premium-label { font-size: 12px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.04em; display: block; margin-bottom: 12px; }
        .premium-input-wrapper { display: flex; align-items: center; gap: 14px; background: var(--bg-elevated); border: 2px solid var(--border-subtle); border-radius: 16px; padding: 4px 18px; transition: 0.2s; }
        .premium-input-wrapper input { background: transparent; border: none; outline: none; padding: 12px 0; width: 100%; font-weight: 600; font-size: 14px; color: var(--text-primary); }
        .premium-input-wrapper:focus-within { border-color: var(--primary-500); background: var(--bg-card); box-shadow: 0 0 0 5px rgba(59,130,246,0.1); }
        .field-icon { color: var(--text-muted); }
        .accent-box { border-color: var(--primary-200); background: var(--primary-50); }

        .modal-actions-premium { display: flex; gap: 16px; margin-top: 40px; }
        .selection-info-banner { display: flex; align-items: center; gap: 18px; background: var(--primary-50); padding: 20px; border-radius: 20px; margin-bottom: 28px; border: 1px solid var(--primary-100); }
        .banner-icon-box { width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary-500); box-shadow: 0 4px 15px rgba(59,130,246,0.1); }
        .b-title { font-size: 14.5px; font-weight: 600; color: var(--primary-600); margin-bottom: 2px; }
        .b-sub { font-size: 12px; color: var(--primary-400); margin: 0; }
      `}</style>
    </div>
  )
}
