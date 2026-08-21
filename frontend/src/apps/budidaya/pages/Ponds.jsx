import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton, EmptyState } from '../components/UXComponents'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'

// ── Colour helpers ──────────────────────────────────────────────────────────
const STATUS = {
  healthy: { label: 'AKTIF', bg: '#D1FAE5', text: '#059669' },
  warning: { label: 'PERINGATAN', bg: '#FEE2E2', text: '#EF4444' },
  kosong:  { label: 'KOSONG',   bg: '#F1F5F9', text: '#64748B' },
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

  const renderTableView = () => (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
      <div className="aq-table-container">
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
            {filtered.map((pond) => {
              const st = STATUS[pond.status_key] || STATUS.kosong
              return (
                <TableRow key={pond.id} onClick={() => navigate(`/budidaya/ponds/${pond.id}`)} style={{ cursor: 'pointer' }}>
                  <TableCell>
                    <span style={{ fontWeight: 700, color: '#1B4332', background: '#E8F5ED', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                      {pond.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{pond.name}</span>
                  </TableCell>
                  <TableCell isSecondary>
                    <span style={{ textTransform: 'capitalize' }}>{pond.type || '-'}</span>
                  </TableCell>
                  <TableCell>{pond.age_days} hari</TableCell>
                  <TableCell>
                    <span style={{ fontWeight: 600 }}>
                      {(pond.population || 0).toLocaleString()} {terms.populationCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      background: st.bg, color: st.text, display: 'inline-block'
                    }}>
                      {st.label}
                    </span>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button 
                        style={{ padding: '6px 12px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/budidaya/ponds/${pond.id}`) }}
                      >
                        Detail
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <div className="aq-container">

      {/* ── Page Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        {/* Search bar */}
        <div style={{ position: 'relative', width: '320px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '18px' }}>search</span>
          <input 
            placeholder={`Cari kode atau nama ${terms.unitLower}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13.5px', outline: 'none' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            borderRadius: '10px', background: '#1B4332', color: '#fff', border: 'none',
            fontWeight: 700, cursor: 'pointer'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          {terms.addUnit}
        </button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{`Memuat data ${terms.unitLower}...`}</p>
        </div>
      ) : ponds.length === 0 ? (
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
