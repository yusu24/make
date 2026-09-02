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
    <div className="animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '18px' }}>search</span>
            <input
              type="text"
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                background: '#ffffff', border: '1px solid #CBD5E1',
                borderRadius: '8px', fontSize: '13px', outline: 'none',
                color: '#0f172a', boxSizing: 'border-box'
              }}
              placeholder="Cari ID atau subjek tiket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '160px' }}>
            <select 
              style={{
                width: '100%', padding: '8px 12px',
                background: '#ffffff', border: '1px solid #CBD5E1',
                borderRadius: '8px', fontSize: '13px', outline: 'none',
                color: '#0f172a'
              }} 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {!hideAction && (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsModalOpen(true)} 
            style={{ 
              height: '38px', padding: '0 16px', borderRadius: '8px', 
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' 
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Buat Tiket Baru
          </button>
        )}
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="spinner" style={{ width: 30, height: 30, borderWidth: 3 }}></span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Memuat data tiket...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', background: '#F8FAFC' }}>
            <div style={{ display: 'inline-flex', padding: 16, background: '#E8F5ED', borderRadius: '50%', marginBottom: 12 }}>
              <MessageSquare size={36} color="#1B4332" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Belum Ada Tiket</h3>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 16, maxWidth: 360, margin: '0 auto 16px' }}>
              Jika Anda memiliki pertanyaan, kendala, atau permintaan fitur, silakan buat tiket baru.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsModalOpen(true)}
              style={{ height: '36px', padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
            >
              Buat Tiket Pertama
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Tiket & Tanggal</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjek & Kategori</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prioritas</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ditugaskan Ke</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{t.id}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{t.date}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '13px', marginBottom: 2 }}>{t.subject}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11.5px', color: '#64748B' }}>
                        <Tag size={11} /> <span style={{ textTransform: 'capitalize' }}>{t.category}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'capitalize', color: getPriorityColor(t.priority), fontWeight: 600, fontSize: '12.5px' }}>
                        <AlertCircle size={13} /> {t.priority}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {t.assigned !== '—' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#E8F5ED', color: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700 }}>
                            {t.assigned.charAt(0)}
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#334155' }}>{t.assigned}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12.5px' }}>Belum ditugaskan</span>
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
