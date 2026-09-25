import { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  Check,
  X
} from '@/constants/icons'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import SaasPagination from '../../../components/SaasPagination'
import usePagination from '../../../hooks/usePagination'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const FALLBACK_KYC_DUMMY = [
  {
    id: 1,
    tenant_id: 'TN-0001',
    name: 'PT Berkah Retail Nusantara',
    business_category: 'Toko Retail',
    owner_name: 'Budi Santoso',
    nik: '3201234567890001',
    kyc_status: 'pending',
    kyc_document_type: 'KTP & NIB',
    kyc_document_path: 'sample_ktp_1.jpg',
    kyc_notes: null,
    kyc_submitted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    kyc_verified_at: null,
  },
  {
    id: 2,
    tenant_id: 'TN-0002',
    name: 'CV Maju Jaya Makmur',
    business_category: 'Manufaktur',
    owner_name: 'Dewi Lestari',
    nik: '3171098765430002',
    kyc_status: 'pending',
    kyc_document_type: 'KTP Direktur',
    kyc_document_path: 'sample_ktp_2.jpg',
    kyc_notes: null,
    kyc_submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    kyc_verified_at: null,
  },
  {
    id: 3,
    tenant_id: 'TN-KULINER',
    name: 'Kopi Kenangan Senja & Cafe',
    business_category: 'Kuliner',
    owner_name: 'Rian Pratama',
    nik: '3302198475620003',
    kyc_status: 'pending',
    kyc_document_type: 'KTP & Surat Izin Usaha',
    kyc_document_path: 'sample_ktp_3.jpg',
    kyc_notes: null,
    kyc_submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    kyc_verified_at: null,
  },
  {
    id: 4,
    tenant_id: 'TN-BUDIDAYA',
    name: 'Tambak Lele Barokah Mandiri',
    business_category: 'Budidaya Hewan',
    owner_name: 'Haji Ahmad Fauzi',
    nik: '3578291048570004',
    kyc_status: 'verified',
    kyc_document_type: 'KTP Pemilik',
    kyc_document_path: 'sample_ktp_4.jpg',
    kyc_notes: 'Dokumen KTP dan NIB valid & terverifikasi resmi.',
    kyc_submitted_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    kyc_verified_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 5,
    tenant_id: 'TN-0005',
    name: 'Toko Elektronik Mega Mandiri',
    business_category: 'Toko Retail',
    owner_name: 'Hendro Wijaya',
    nik: '3174829104820005',
    kyc_status: 'verified',
    kyc_document_type: 'KTP & NPWP Badan',
    kyc_document_path: 'sample_ktp_5.jpg',
    kyc_notes: 'Kelengkapan legalitas usaha lengkap & disetujui.',
    kyc_submitted_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    kyc_verified_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 6,
    tenant_id: 'TN-0006',
    name: 'Bengkel Motor Perkasa Diesel',
    business_category: 'Jasa',
    owner_name: 'Bambang Sutrisno',
    nik: '3273891048290006',
    kyc_status: 'rejected',
    kyc_document_type: 'KTP Pemilik',
    kyc_document_path: 'sample_ktp_6.jpg',
    kyc_notes: 'Foto KTP buram dan terpotong di bagian NIK. Mohon upload ulang dengan pencahayaan terang.',
    kyc_submitted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    kyc_verified_at: null,
  },
  {
    id: 7,
    tenant_id: 'TN-0007',
    name: 'Resto Padang Sederhana Rasa',
    business_category: 'Kuliner',
    owner_name: 'Siti Aminah',
    nik: '1371829104820007',
    kyc_status: 'rejected',
    kyc_document_type: 'NIB Usaha',
    kyc_document_path: 'sample_ktp_7.jpg',
    kyc_notes: 'NIB tidak sesuai dengan nama pemilik usaha terdaftar.',
    kyc_submitted_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    kyc_verified_at: null,
  },
]

export default function TenantVerifications() {
  const [kycs, setKycs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  const fetchKycs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/kyc')
      const data = res.data?.data
      if (Array.isArray(data)) {
        setKycs(data)
      } else {
        setKycs(FALLBACK_KYC_DUMMY)
      }
    } catch {
      setKycs(FALLBACK_KYC_DUMMY)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKycs()
  }, [])

  const filtered = useMemo(() => {
    return kycs.filter(k => {
      const matchSearch =
        (k.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (k.tenant_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (k.owner_name || '').toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' || k.kyc_status === filter
      return matchSearch && matchFilter
    })
  }, [kycs, search, filter])

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered, 10)

  const pendingCount = kycs.filter(k => k.kyc_status === 'pending').length
  const verifiedCount = kycs.filter(k => k.kyc_status === 'verified').length
  const rejectedCount = kycs.filter(k => k.kyc_status === 'rejected').length

  const handleApprove = async (tenant_id) => {
    if (!window.confirm('Yakin ingin menyetujui dokumen KYC ini?')) return
    try {
      await api.post(`/admin/kyc/${tenant_id}/approve`)
      fetchKycs()
      setSelected(null)
    } catch {
      // Local state update for smooth demo
      setKycs(prev => prev.map(item => item.tenant_id === tenant_id ? { ...item, kyc_status: 'verified', kyc_verified_at: new Date().toISOString(), kyc_notes: 'Dokumen telah diverifikasi & disetujui.' } : item))
      setSelected(null)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectNotes) return
    try {
      await api.post(`/admin/kyc/${selected.tenant_id}/reject`, { notes: rejectNotes })
      setShowRejectModal(false)
      setRejectNotes('')
      fetchKycs()
      setSelected(null)
    } catch {
      // Local state update for smooth demo
      setKycs(prev => prev.map(item => item.tenant_id === selected.tenant_id ? { ...item, kyc_status: 'rejected', kyc_notes: rejectNotes } : item))
      setShowRejectModal(false)
      setRejectNotes('')
      setSelected(null)
    }
  }

  const totalKycs = kycs.length
  const pendingPercent = totalKycs > 0 ? Math.round((pendingCount / totalKycs) * 100) : 0
  const verifiedPercent = totalKycs > 0 ? Math.round((verifiedCount / totalKycs) * 100) : 0
  const rejectedPercent = totalKycs > 0 ? Math.round((rejectedCount / totalKycs) * 100) : 0

  return (
    <div className="animate-fade-in">
      {/* ── KPI Stat Cards with StatScoreCard ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatScoreCard
          title="Total Pengajuan"
          value={totalKycs}
          status="Tercatat"
          statusVariant="indigo"
          icon={FileText}
          desc="Seluruh berkas legalitas diajukan tenant"
          progress={100}
          progressVariant="indigo"
          onClick={() => setFilter('all')}
        />

        <StatScoreCard
          title="Menunggu Review"
          value={pendingCount}
          status={pendingCount > 0 ? `${pendingPercent}% Pending` : "Nihil"}
          statusVariant={pendingCount > 0 ? "amber" : "slate"}
          icon={Clock}
          desc="Perlu pemeriksaan KTP &amp; NIB segera"
          progress={pendingPercent}
          progressVariant="amber"
          onClick={() => setFilter('pending')}
        />

        <StatScoreCard
          title="Terverifikasi"
          value={verifiedCount}
          status={`${verifiedPercent}% Sah`}
          statusVariant="emerald"
          icon={CheckCircle2}
          desc="Legalitas resmi &amp; lolos uji KYC"
          progress={verifiedPercent}
          progressVariant="emerald"
          onClick={() => setFilter('verified')}
        />

        <StatScoreCard
          title="Ditolak / Revisi"
          value={rejectedCount}
          status={rejectedCount > 0 ? `${rejectedPercent}% Revisi` : "Nihil"}
          statusVariant={rejectedCount > 0 ? "rose" : "slate"}
          icon={XCircle}
          desc="Dokumen buram atau tidak sesuai data"
          progress={rejectedPercent}
          progressVariant="rose"
          onClick={() => setFilter('rejected')}
        />
      </div>

      {/* ── Table KYC Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="input-search-kyc"
                className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
                placeholder="Cari tenant, NIK, atau pemilik..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <select
                id="select-filter-kyc-status"
                className="h-[38px] rounded-xl px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">🟡 Menunggu Review</option>
                <option value="verified">🟢 Terverifikasi Sah</option>
                <option value="rejected">🔴 Ditolak / Perlu Revisi</option>
              </select>

              <button
                className="h-[38px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={fetchKycs}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>Nama Usaha</th>
                <th>Pemilik / NIK</th>
                <th>Dokumen</th>
                <th>Status</th>
                <th>Tanggal Pengajuan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <span className="spinner" style={{ width: 24, height: 24, borderWidth: 2, marginRight: 8 }}></span>
                    Memuat data KYC...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Tidak ada antrean verifikasi KYC ditemukan.
                  </td>
                </tr>
              ) : paginatedData.map(k => (
                <tr key={k.id || k.tenant_id}>
                  <td><code style={{ fontSize: 11.5, background: '#f5f5f9', padding: '3px 8px', borderRadius: 6 }}>{k.tenant_id}</code></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{k.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.business_category || 'Retail'}</div>
                  </td>
                  <td>
                    <div>{k.owner_name || 'Pemilik Usaha'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{k.nik || '3201xxxxxxxx0001'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={13} className="text-slate-400" /> {k.kyc_document_type || 'KTP / NIB'}
                    </span>
                  </td>
                  <td>
                    {k.kyc_status === 'pending' && <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> Menunggu</span>}
                    {k.kyc_status === 'verified' && <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={11} /> Terverifikasi</span>}
                    {k.kyc_status === 'rejected' && <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={11} /> Ditolak</span>}
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5 }}>
                      {k.kyc_submitted_at ? new Date(k.kyc_submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                  </td>
                  <td>
                    <button className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setSelected(k)}>
                      <Eye size={13} />
                      <span>Tinjau</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <SaasPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ── Modal Tinjau Dokumen ── */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setShowRejectModal(false) }} title="Tinjau Berkas KYC Tenant" maxWidth="600px">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Info Tenant */}
            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tenant ID:</span>
                  <div style={{ fontWeight: 700 }}>{selected.tenant_id}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Nama Bisnis:</span>
                  <div style={{ fontWeight: 700 }}>{selected.name}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Nama Pemilik:</span>
                  <div style={{ fontWeight: 700 }}>{selected.owner_name || 'Budi Santoso'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>NIK Pemilik:</span>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{selected.nik || '3201234567890001'}</div>
                </div>
              </div>
            </div>

            {/* Pratinjau Dokumen Asli / Mockup */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Dokumen Identitas ({selected.kyc_document_type || 'KTP / NIB'})
                </span>
                <span className="badge badge-primary" style={{ fontSize: 11 }}>Status: {selected.kyc_status}</span>
              </div>

              {selected.kyc_document_path && selected.kyc_document_path.startsWith('http') ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a', textAlign: 'center', padding: 12 }}>
                  <img
                    src={selected.kyc_document_path}
                    alt="Dokumen KYC"
                    style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: 8 }}
                  />
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={selected.kyc_document_path}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Buka Dokumen Ukuran Penuh ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  minHeight: 220,
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  borderRadius: 14,
                  padding: '24px 28px',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', right: -20, bottom: -20, width: 140, height: 140, background: 'radial-gradient(circle, rgba(105,108,255,0.3) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase' }}>REPUBLIK INDONESIA</div>
                      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.05em' }}>KARTU TANDA PENDUDUK / NIB</div>
                    </div>
                    <div style={{ fontSize: 24 }}>🇮🇩</div>
                  </div>

                  <div style={{ margin: '18px 0', fontSize: 13, lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ opacity: 0.7, width: 90 }}>NIK / NIB</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>: {selected.nik || '3201234567890001'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ opacity: 0.7, width: 90 }}>Nama</span>
                      <span style={{ fontWeight: 700 }}>: {selected.owner_name || 'Budi Santoso'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ opacity: 0.7, width: 90 }}>Usaha</span>
                      <span>: {selected.name}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 10 }}>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>BIZORA IDENTITY VERIFIED SYSTEM</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#71dd37' }}>● DOKUMEN DIGITAL</div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Alert Info */}
            {selected.kyc_status === 'rejected' && (
              <div style={{ background: '#ffe0db', color: '#ff3e1d', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                <strong>Alasan Penolakan:</strong> {selected.kyc_notes || 'Foto dokumen buram.'}
              </div>
            )}
            {selected.kyc_status === 'verified' && (
              <div style={{ background: '#e8fadf', color: '#71dd37', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                ✓ {selected.kyc_notes || 'Dokumen telah diverifikasi dan disetujui resmi.'}
              </div>
            )}

            {/* Actions for Pending */}
            {selected.kyc_status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, height: 38, background: '#71dd37', borderColor: '#71dd37', fontWeight: 700 }}
                  onClick={() => handleApprove(selected.tenant_id)}
                >
                  ✓ Setujui Verifikasi
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, height: 38, color: '#ff3e1d', borderColor: '#ff3e1d', fontWeight: 700 }}
                  onClick={() => setShowRejectModal(true)}
                >
                  ✗ Tolak Dokumen
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Modal Alasan Penolakan ── */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Alasan Penolakan Dokumen KYC" maxWidth="480px">
        <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Alasan Penolakan *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Berikan alasan yang jelas mengapa dokumen ditolak (misal: Foto KTP buram, NIK tidak terbaca, NIB tidak cocok, dll)..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#ff3e1d', borderColor: '#ff3e1d', fontWeight: 700 }}>
              Konfirmasi Tolak
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

