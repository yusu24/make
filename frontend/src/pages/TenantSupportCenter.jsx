import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Plus, Search, MessageSquare, Tag, AlertCircle, Clock } from 'lucide-react'
import { api } from '../lib/api'
import Modal from '../components/Modal'
import '../apps/admin/pages/Shared.css'

const TenantSupportCenter = forwardRef(({ hideAction }, ref) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    subject: '',
    category: 'question',
    priority: 'low',
    description: ''
  })

  useImperativeHandle(ref, () => ({
    openNewTicketModal: () => setIsModalOpen(true)
  }))

  useEffect(() => {
    fetchTickets()
  }, [filterStatus])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/support/tickets', {
        params: { status: filterStatus, search }
      })
      setTickets(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTickets()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/support/tickets', formData)
      setIsModalOpen(false)
      setFormData({ subject: '', category: 'question', priority: 'low', description: '' })
      fetchTickets()
    } catch (err) {
      alert('Gagal membuat tiket: ' + (err.response?.data?.message || 'Error'))
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return <span className="badge badge-red">Open</span>
      case 'in_progress': return <span className="badge badge-yellow">In Progress</span>
      case 'resolved': return <span className="badge badge-green">Resolved</span>
      default: return <span className="badge badge-gray">{status}</span>
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'var(--danger-500)'
      case 'medium': return 'var(--warning-500)'
      default: return 'var(--success-500)'
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!hideAction && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            Buat Tiket Baru
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>search</span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', width: '100%' }}
            placeholder="Cari ID atau subjek tiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: '200px', flexShrink: 0 }}>
          <select className="form-select" style={{ width: '100%' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="card card-pad" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></span>
              <span style={{ fontSize: 16 }}>Memuat data tiket...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 20, background: 'var(--bg-elevated)', borderRadius: '50%', marginBottom: 16 }}>
              <MessageSquare size={48} color="var(--primary-400)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>Belum Ada Tiket</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              Jika Anda memiliki pertanyaan, kendala, atau permintaan fitur, silakan buat tiket baru.
            </p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Buat Tiket Pertama</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID Tiket & Tanggal</th>
                  <th>Subjek & Kategori</th>
                  <th>Prioritas</th>
                  <th>Status</th>
                  <th>Ditugaskan Ke</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.date}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{t.subject}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Tag size={12} /> <span style={{ textTransform: 'capitalize' }}>{t.category}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize', color: getPriorityColor(t.priority), fontWeight: 600, fontSize: 13 }}>
                        <AlertCircle size={14} /> {t.priority}
                      </div>
                    </td>
                    <td>{getStatusBadge(t.status)}</td>
                    <td>
                      {t.assigned !== '—' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                            {t.assigned.charAt(0)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{t.assigned}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Belum ditugaskan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Tiket Bantuan Baru" maxWidth="600px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div className="form-group">
            <label className="form-label">Subjek / Judul Tiket</label>
            <input 
              type="text" 
              required
              className="form-input"
              placeholder="Contoh: Fitur laporan penjualan tidak bisa diekspor"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Kategori Kendala</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="question">Pertanyaan Umum</option>
                <option value="bug">Error / Bug Sistem</option>
                <option value="feature">Saran / Request Fitur</option>
                <option value="billing">Tagihan / Pembayaran</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prioritas</label>
              <select 
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Rendah (Low)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="high">Tinggi / Kritis (High)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Kendala</label>
            <textarea 
              required
              rows="5"
              className="form-input"
              style={{ resize: 'vertical' }}
              placeholder="Jelaskan secara detail kendala atau pertanyaan Anda..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Kirim Tiket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
})

export default TenantSupportCenter
