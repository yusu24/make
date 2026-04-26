import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { 
  Package, Plus, Search, Trash2, 
  ArrowUpCircle, AlertCircle, ShoppingBag, 
  ChevronRight, MoreVertical, Edit2, 
  Layers, Database, Filter, ArrowRight,
  TrendingDown, TrendingUp, Info
} from 'lucide-react'
import Modal from '../../../components/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'

export default function Feeds() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [restockModalOpen, setRestockModalOpen] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState(null)
  
  const [formData, setFormData] = useState({ name: '', stock_kg: '' })
  const [restockAmount, setRestockAmount] = useState('')

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

  const handleAddFeed = async (e) => {
    e.preventDefault()
    try {
      await api.post('/budidaya/feeds', formData)
      setModalOpen(false)
      setFormData({ name: '', stock_kg: '' })
      fetchFeeds()
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan data') }
  }

  const handleRestock = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/budidaya/feeds/${selectedFeed.id}/add`, { amount_kg: restockAmount })
      setRestockModalOpen(false)
      setRestockAmount('')
      fetchFeeds()
    } catch (err) { alert(err.response?.data?.message || 'Gagal menambah stok') }
  }

  const filteredFeeds = feeds.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalStok = feeds.reduce((acc, f) => acc + Number(f.stock_kg), 0)
  const lowStockCount = feeds.filter(f => Number(f.stock_kg) < 50).length

  return (
    <div className="animate-fade-in page-content">
      {/* Premium Header */}
      <div className="page-header">
        <div className="header-context-box">
          <div className="premium-icon-badge">
            <Package size={28} />
            <div className="badge-glow"></div>
          </div>
          <div>
            <h2 className="page-title">Inventaris Logistik</h2>
            <p className="page-sub">Manajemen pakan presisi & kontrol stok real-time</p>
          </div>
        </div>
        
        <button className="btn btn-primary btn-lg" onClick={() => { setSelectedFeed(null); setModalOpen(true); }}>
          <Plus size={20} />
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
          <div className="loading-state-premium">
             <div className="spinner-glow"></div>
             <p className="loading-text">Menyinkronkan data gudang...</p>
          </div>
        ) : filteredFeeds.length === 0 ? (
          <div className="empty-state-premium">
             <div className="empty-icon-wrap">
                <ShoppingBag size={64} style={{ opacity: 0.1 }} />
             </div>
             <h3 className="premium-title-900" style={{ fontSize: 20, marginBottom: 8 }}>Gudang Logistik Kosong</h3>
             <p className="text-secondary mb-6">Belum ada data pakan yang terdaftar di sistem.</p>
             <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>Daftar Pakan Pertama</button>
          </div>
        ) : (
          <div className="aq-table-container">
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell>Nama / merk pakan</TableHeaderCell>
                  <TableHeaderCell>Estimasi stok</TableHeaderCell>
                  <TableHeaderCell>Kategori status</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right' }}>Manajemen</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeeds.map((feed, idx) => {
                  const isLow = Number(feed.stock_kg) < 50;
                  return (
                    <TableRow key={feed.id}>
                      <TableCell>
                        <div className="feed-text-group">
                          <span className="f-name">{feed.name}</span>
                          <span className="f-id">ID: FEED-{feed.id.toString().padStart(4, '0')}</span>
                        </div>
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
                        <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`} style={{ 
                          padding: '6px 12px',
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: '0.05em'
                        }}>
                          {isLow ? 'LIMIT TERCAPAI' : 'TERSEDIA'}
                        </span>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div className="table-row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-sm btn-primary-alt" onClick={() => { setSelectedFeed(feed); setRestockModalOpen(true); }} style={{ fontWeight: 900 }}>
                             <ArrowUpCircle size={14} /> Restok
                          </button>
                          <button className="btn-icon-more"><Edit2 size={14} /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Styled Modals */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Logistik Baru">
        <form onSubmit={handleAddFeed} className="premium-form-fluid">
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
           <div className="modal-actions-premium">
              <button type="button" className="btn btn-secondary flex-1" onClick={() => setModalOpen(false)}>Batalkan</button>
              <button type="submit" className="btn btn-primary flex-2">Simpan Logistik</button>
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
           <div className="modal-actions-premium">
              <button type="button" className="btn btn-secondary flex-1" onClick={() => setRestockModalOpen(false)}>Tutup</button>
              <button type="submit" className="btn btn-primary flex-2">Konfirmasi Stok</button>
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

        .premium-feed-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .kpi-highlight-box { 
           position: relative; overflow: hidden; display: flex; align-items: center; gap: 24px; padding: 28px !important; 
           transition: all 0.3s;
        }
        .kpi-highlight-box:hover { transform: translateY(-5px); border-color: var(--primary-400); }
        .kpi-highlight-box.primary { border-left: 6px solid var(--success-500); }
        .kpi-highlight-box.danger { border-left: 6px solid var(--danger-500); }
        .kpi-highlight-box.success { border-left: 6px solid var(--success-500); }
        .kpi-highlight-box.info { border-left: 6px solid var(--primary-500); }

        .kpi-icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: var(--bg-elevated); color: var(--text-muted); }
        .primary .kpi-icon-wrapper { background: var(--success-50); color: var(--success-600); }
        .danger .kpi-icon-wrapper { background: var(--danger-50); color: var(--danger-600); }
        .success .kpi-icon-wrapper { background: var(--success-50); color: var(--success-600); }
        .info .kpi-icon-wrapper { background: var(--primary-50); color: var(--primary-600); }

        .kpi-info .label { display: block; font-size: 13px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .kpi-info .value { font-size: 28px; font-weight: 950; color: var(--text-primary); font-family: var(--font-heading); }
        .kpi-info .value small { font-size: 14px; font-weight: 700; color: var(--text-muted); }
        .kpi-trend { position: absolute; top: 20px; right: 20px; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 40px; background: var(--bg-elevated); color: var(--text-muted); }
        .positive { color: var(--success-500); }

        .board-container { border-radius: 32px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.05) !important; background: var(--bg-card) !important; }
        .board-header { padding: 24px 32px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); }
        .search-box-premium { position: relative; width: 400px; display: flex; align-items: center; gap: 12px; background: var(--bg-elevated); padding: 12px 20px; border-radius: 16px; border: 1px solid var(--border-subtle); transition: 0.2s; }
        .search-box-premium input { background: transparent; border: none; outline: none; width: 100%; font-weight: 700; font-size: 15px; color: var(--text-primary); }
        .search-box-premium input::placeholder { color: var(--text-muted); }
        .search-icon { color: var(--text-muted); }
        .search-box-premium:focus-within { border-color: var(--primary-500); background: var(--bg-card); box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }

        .loading-state-premium { padding: 100px 0; text-align: center; }
        .spinner-glow { width: 50px; height: 50px; border-radius: 50%; border: 4px solid var(--primary-50); border-top-color: var(--primary-500); animation: spin 1s linear infinite; margin: 0 auto 20px; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
        .loading-text { font-weight: 800; color: var(--text-muted); letter-spacing: 0.05em; }

        .feed-identity-row { display: flex; align-items: center; gap: 18px; }
        .feed-icon-square { width: 44px; height: 44px; border-radius: 12px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.3s; }
        .f-name { display: block; font-size: 16px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.01em; margin-bottom: 2px; }
        .f-id { font-size: 11px; font-weight: 800; color: var(--text-muted); font-family: monospace; }
        tr:hover .feed-icon-square { background: var(--primary-500); color: white; transform: rotate(5deg); }

        .stock-visual-bar { width: 240px; }
        .visual-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
        .v-val { font-size: 18px; font-weight: 950; color: var(--text-primary); font-family: var(--font-heading); }
        .v-val small { font-size: 13px; font-weight: 700; color: var(--text-muted); }
        .v-perc { font-size: 12px; font-weight: 900; color: var(--text-muted); }
        .v-progress-bg { height: 10px; background: var(--bg-elevated); border-radius: 20px; overflow: hidden; position: relative; }
        .v-progress-fill { height: 100%; border-radius: 20px; transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
        .v-progress-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 2s infinite; }
        .v-progress-fill.is-safe { background: linear-gradient(90deg, #10b981, #34d399); }
        .v-progress-fill.is-low { background: linear-gradient(90deg, #ef4444, #f87171); box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }

        .status-pill { display: inline-flex; align-items: center; gap: 10px; padding: 6px 16px; border-radius: 40px; font-size: 12px; font-weight: 900; }
        .status-pill.success { background: var(--success-50); color: var(--success-600); }
        .status-pill.danger { background: var(--danger-50); color: var(--danger-500); border: 1px solid var(--danger-100); }
        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .status-pill.danger .pulse-dot { animation: pulse 1.5s infinite; }

        .table-row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .btn-primary-alt { background: var(--primary-50); color: var(--primary-600); border: 1px solid var(--primary-100); font-weight: 800; border-radius: 12px !important; }
        .btn-primary-alt:hover { background: var(--primary-600); color: white; transform: translateY(-2px); }
        .btn-icon-more { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-elevated); border: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-icon-more:hover { background: var(--primary-500); color: white; }

        .premium-form-fluid .premium-label { font-size: 12px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.08em; display: block; margin-bottom: 12px; }
        .premium-input-wrapper { display: flex; align-items: center; gap: 14px; background: var(--bg-elevated); border: 2px solid var(--border-subtle); border-radius: 16px; padding: 4px 18px; transition: 0.2s; }
        .premium-input-wrapper input { background: transparent; border: none; outline: none; padding: 12px 0; width: 100%; font-weight: 700; font-size: 16px; color: var(--text-primary); }
        .premium-input-wrapper:focus-within { border-color: var(--primary-500); background: var(--bg-card); box-shadow: 0 0 0 5px rgba(59,130,246,0.1); }
        .field-icon { color: var(--text-muted); }
        .accent-box { border-color: var(--primary-200); background: var(--primary-50); }

        .modal-actions-premium { display: flex; gap: 16px; margin-top: 40px; }
        .selection-info-banner { display: flex; align-items: center; gap: 18px; background: var(--primary-50); padding: 20px; border-radius: 20px; margin-bottom: 28px; border: 1px solid var(--primary-100); }
        .banner-icon-box { width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary-500); box-shadow: 0 4px 15px rgba(59,130,246,0.1); }
        .b-title { font-size: 16px; font-weight: 900; color: var(--primary-600); margin-bottom: 2px; }
        .b-sub { font-size: 13px; color: var(--primary-400); margin: 0; }
      `}</style>
    </div>
  )
}
