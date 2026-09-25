import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton, EmptyState } from '../components/UXComponents'
import { BudidayaTableSkeleton } from '../components/BudidayaTableSkeleton'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'

import usePagination from '../../../hooks/usePagination'
import BudidayaPagination from '../components/BudidayaPagination'

// ── Colour helpers ──────────────────────────────────────────────────────────
const STATUS = {
  healthy: { label: 'Aktif', bg: '#D1FAE5', text: '#059669' },
  warning: { label: 'Peringatan', bg: '#FEE2E2', text: '#EF4444' },
  kosong:  { label: 'Kosong',   bg: '#F1F5F9', text: '#64748B' },
}

export default function Ponds() {
  const navigate = useNavigate()
  const terms = useBudidayaTerms()
  const [ponds, setPonds]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  
  // We determine default type based on categories
  const defaultType = terms.isTanaman ? 'tanah' : (terms.types?.[0]?.[0] || 'tanah')
  const [formData, setFormData] = useState({
    name: '', code: '', type: defaultType, area: '',
    area_m2: '', depth_cm: '', max_fish_count: '', status: 'kosong',
  })
  const [saving, setSaving] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (modalOpen) {
      setFormData({
        name: '', code: '', type: defaultType, area: '',
        area_m2: '', depth_cm: '', max_fish_count: '', status: 'kosong',
      })
    }
  }, [modalOpen, defaultType])

  useEffect(() => { fetchPonds() }, [])

  const fetchPonds = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/ponds')
      setPonds(data.data || [])
    } catch { setPonds([]) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/budidaya/ponds', formData)
      setModalOpen(false)
      fetchPonds()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const calculateAge = (dateStr) => {
    if (!dateStr) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  }

  const displayPonds = ponds.map((p, i) => {
    const isAktif = p.active_cycle != null;
    const defaultPrefix = terms.category === 'livestock' ? 'KDG' : (terms.isTanaman ? 'LHN' : 'KLM');
    return {
      id: p.id,
      code: p.code || `${defaultPrefix}-${String(p.id).padStart(2, '0')}`,
      name: p.name,
      status_key: isAktif ? 'healthy' : (p.status === 'maintenance' ? 'warning' : 'kosong'),
      age_days: isAktif ? calculateAge(p.active_cycle.seed_date) : 0,
      population: isAktif ? p.active_cycle.seed_count : 0,
      active_cycle: p.active_cycle,
      type: p.type
    }
  })

  const filtered = displayPonds.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filtered)

  const renderTableView = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <Table>
        <TableHeader>
          <TableRow isHoverable={false}>
            <TableHeaderCell>{terms.unitCode}</TableHeaderCell>
            <TableHeaderCell>{terms.unitName}</TableHeaderCell>
            <TableHeaderCell>{terms.typeUnit}</TableHeaderCell>
            <TableHeaderCell>Usia (hari)</TableHeaderCell>
            <TableHeaderCell>{terms.populationCountTitle}</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <BudidayaTableSkeleton rows={5} cols={7} />
          ) : paginatedData.map((pond) => {
            const st = STATUS[pond.status_key] || STATUS.kosong
            return (
              <TableRow key={pond.id} onClick={() => navigate(`/budidaya/ponds/${pond.id}`)} style={{ cursor: 'pointer' }}>
                <TableCell>
                  <span style={{ color: '#1B4332', background: '#E8F5ED', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                    {pond.code}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ color: '#1E293B' }}>{pond.name}</span>
                </TableCell>
                <TableCell isSecondary>
                  <span style={{ textTransform: 'capitalize' }}>{pond.type || '-'}</span>
                </TableCell>
                <TableCell>{pond.age_days} hari</TableCell>
                <TableCell>
                  <span>
                    {(pond.population || 0).toLocaleString()} {terms.populationCount}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="badge-pill" style={{ 
                    background: st.bg, color: st.text
                  }}>
                    {st.label}
                  </span>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div className="table-row-actions" style={{ justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-table-action"
                      title="Detail"
                      onClick={(e) => { e.stopPropagation(); navigate(`/budidaya/ponds/${pond.id}`) }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
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
    </div>
  )

  return (
    <div className="aq-container">

      {/* ── Standard KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-['Inter']">Total {terms.unit}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{terms.iconMain}</span>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
              {ponds.length}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1 font-['Inter']">Terdaftar di sistem</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-['Inter']">{terms.unit} Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
              {displayPonds.filter(p => p.status_key === 'healthy').length}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1 font-['Inter']">Siklus budidaya aktif</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-['Inter']">Perawatan</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>build</span>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
              {displayPonds.filter(p => p.status_key === 'warning').length}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1 font-['Inter']">Sterilisasi / Perbaikan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-['Inter']">Kosong / Siap</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>crop_free</span>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
              {displayPonds.filter(p => p.status_key === 'kosong').length}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1 font-['Inter']">Siap tebar siklus baru</div>
          </div>
        </div>
      </div>

      {/* ── Page Actions Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs mb-5 flex items-center justify-between flex-wrap gap-3">
        {/* Search bar */}
        <div style={{ position: 'relative', width: '320px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '18px' }}>search</span>
          <input 
            placeholder={`Cari kode atau nama ${terms.unitLower}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all font-['Inter']"
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setModalOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, height: '38px', padding: '0 16px',
            borderRadius: '12px', background: '#1B4332', color: '#fff', border: 'none',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          {terms.addUnit}
        </button>
      </div>

      {/* ── Content ── */}
      {!loading && ponds.length === 0 ? (
        <EmptyState 
          icon={terms.iconSeed}
          title={`Belum ada ${terms.unitLower}`}
          description={`Daftarkan ${terms.unitLower} pertama Anda untuk mulai memantau siklus budidaya.`}
          onAction={() => setModalOpen(true)}
          actionLabel={terms.registerUnit}
        />
      ) : (
        renderTableView()
      )}

      {/* ── Modal Tambah Kolam / Kandang / Lahan ── */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: 32, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B4332' }}>{terms.iconMain}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>{`Tambah ${terms.unit} Baru`}</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{`Masukkan data ${terms.unitLower} baru Anda`}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nama & Kode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>{terms.unitName} *</label>
                  <input
                    required
                    placeholder={`cth: ${terms.mockA1Title || 'Blok A1'}`}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>{terms.unitCode} *</label>
                  <input
                    required
                    placeholder="cth: KDG-01"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Tipe / Jenis */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>{terms.typeUnit}</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13.5, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                >
                  {terms.types?.map(([v, lbl]) => (
                    <option key={v} value={v}>{lbl}</option>
                  ))}
                </select>
              </div>

              {/* Kapasitas & Dimensi */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>{terms.populationLabel}</label>
                  <input
                    type="number"
                    placeholder="cth: 50"
                    value={formData.max_fish_count}
                    onChange={e => setFormData({ ...formData, max_fish_count: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Luas (m²)</label>
                  <input
                    type="number"
                    placeholder="cth: 100"
                    value={formData.area_m2}
                    onChange={e => setFormData({ ...formData, area_m2: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <LoadingButton
                  loading={saving}
                  style={{ padding: '10px 20px', borderRadius: 10, background: '#1B4332', color: '#fff', border: 'none', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  Simpan Data
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
