import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { 
   History, Calendar, ArrowRight, Activity
 } from 'lucide-react'
 import { useNavigate } from 'react-router-dom'
 import Modal from '../../../components/Modal'
 import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
 import { LoadingButton } from '../components/UXComponents'
 import { useBudidayaTerms } from '../hooks/useBudidayaTerms'
 import usePagination from '../../../hooks/usePagination'
 import BudidayaPagination from '../components/BudidayaPagination'
 
 export default function Cycles() {
   const navigate = useNavigate()
   const terms = useBudidayaTerms()
   const [cycles, setCycles] = useState([])
   const [ponds, setPonds] = useState([])
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [modalOpen, setModalOpen] = useState(false)
   
   const [formData, setFormData] = useState({
     pond_id: '',
     seed_type: '',
     seed_count: '',
     seed_date: new Date().toISOString().split('T')[0],
     expected_harvest_date: ''
   })
 
   useEffect(() => {
     fetchData()
   }, [])
 
   const fetchData = async () => {
     try {
       setLoading(true)
       const [cycleRes, pondRes] = await Promise.all([
         api.get('/budidaya/cycles'),
         api.get('/budidaya/ponds', { params: { status: 'kosong' } })
       ])
       console.log('Cycles API Res:', cycleRes.data)
       setCycles(Array.isArray(cycleRes.data.data) ? cycleRes.data.data : [])
       setPonds(Array.isArray(pondRes.data.data) ? pondRes.data.data : [])
     } catch (err) {
       console.error('Fetch Cycles Error:', err)
     } finally {
       setLoading(false)
     }
   }
 
   const handleStartCycle = async (e) => {
     e.preventDefault()
     setSaving(true)
     try {
       await api.post(`/budidaya/ponds/${formData.pond_id}/cycles/start`, formData)
       setModalOpen(false)
       fetchData()
     } catch (err) {
       alert(err.response?.data?.message || 'Gagal memulai siklus')
     } finally {
       setSaving(false)
     }
   }
 
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
  } = usePagination(cycles)

  return (
     <div className="aq-container">
       {/* Header Section */}
       <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 0 }}>
         <button 
           className="btn btn-primary" 
           onClick={() => setModalOpen(true)}
           style={{
             display: 'flex', alignItems: 'center', gap: 6, height: '38px', padding: '0 16px',
             borderRadius: '8px', background: '#1B4332', color: '#fff', border: 'none',
             fontWeight: 600, fontSize: '13px', cursor: 'pointer'
           }}
         >
           <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
           <span>{terms.startCycleLabel}</span>
         </button>
       </div>
 
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Menganalisis data siklus...</p>
          </div>
        ) : cycles.length === 0 ? (
          <div style={{ 
            background: '#fff', padding: '60px 20px', textAlign: 'center', 
            borderRadius: 16, border: '1px solid #E9F0EC' 
          }}>
             <Activity size={48} style={{ marginBottom: 20, opacity: 0.2, color: '#1B4332' }} />
             <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Belum ada siklus berjalan</h3>
             <p style={{ color: '#64748B', fontWeight: 500, fontSize: '13px' }}>{terms.emptyCyclesDesc}</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell>{terms.unit}</TableHeaderCell>
                  <TableHeaderCell>Komoditas</TableHeaderCell>
                  <TableHeaderCell>Tgl {terms.isTanaman ? 'Tanam' : 'Tebar'}</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Total Modal</TableHeaderCell>
                  <TableHeaderCell>Pendapatan</TableHeaderCell>
                  <TableHeaderCell>Laba/Rugi</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>
                      <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 500 }}>{cycle.pond_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: '#0f172a', fontSize: '13px' }}>{cycle.seed_type || '-'}</span>
                      {cycle.seed_count ? <span style={{ color: '#64748B', marginLeft: 4, fontSize: '12px' }}>({(cycle.seed_count).toLocaleString()} {terms.populationCount})</span> : null}
                    </TableCell>
                    <TableCell>
                      <span style={{ color: '#0f172a', fontSize: '13px' }}>
                        {cycle.seed_date ? new Date(cycle.seed_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`badge-pill ${cycle.status === 'panen' ? 'badge-pill-neutral' : 'badge-pill-success'}`} style={{ fontSize: '11.5px' }}>
                        {cycle.status === 'panen' ? 'Selesai' : 'Aktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>Rp {(Number(cycle.total_cost) || 0).toLocaleString('id-ID')}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ color: '#059669', fontSize: '13px', fontWeight: 500 }}>
                        {cycle.status === 'panen' ? `Rp ${(Number(cycle.total_revenue) || 0).toLocaleString('id-ID')}` : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cycle.status === 'panen' ? (
                        <div style={{ color: (cycle.profit || 0) >= 0 ? '#1B4332' : '#EF4444', fontSize: '13px', fontWeight: 500 }}>
                          {(cycle.profit || 0) >= 0 ? '+' : ''}Rp {(Number(cycle.profit) || 0).toLocaleString()}
                        </div>
                      ) : <span style={{ fontSize: '13px' }}>-</span>}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div className="table-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => navigate(`/budidaya/cycles/${cycle.id}`)}
                          title="Detail Siklus"
                          className="btn-table-action"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
        )}
 
       {/* Start Cycle Modal */}
       <Modal 
         isOpen={modalOpen} 
         onClose={() => setModalOpen(false)} 
         title="Inisialisasi Siklus Budidaya"
         maxWidth="600px"
       >
         <form onSubmit={handleStartCycle} className="premium-form-modern">
            <div className="form-group">
               <label>{terms.selectUnit}</label>
               <div className="input-field">
                  <select required value={formData.pond_id} onChange={e => setFormData({...formData, pond_id: e.target.value})}>
                     <option value="">-- Pilih Unit {terms.unit} --</option>
                     {ponds.map(p => (
                       <option key={p.id} value={p.id}>{p.name} ({p.area || 'Tanpa Area'})</option>
                     ))}
                  </select>
               </div>
               {ponds.length === 0 && <p style={{ fontSize: '11px', color: 'var(--danger-500)', marginTop: 8, fontWeight: 600 }}>{terms.noUnitEmpty}</p>}
            </div>
            
            <div className="field-row">
               <div className="form-group">
                  <label>{terms.seedTypeLabel}</label>
                  <div className="input-field">
                     <input 
                        type="text" required placeholder={terms.isTanaman ? 'Misal: Cabai Rawit' : 'Misal: Nila Merah'} 
                        value={formData.seed_type} onChange={e => setFormData({...formData, seed_type: e.target.value})}
                     />
                  </div>
               </div>
               <div className="form-group">
                  <label>{terms.seedCountLabel}</label>
                  <div className="input-field">
                     <input 
                        type="number" required placeholder="0" 
                        value={formData.seed_count} onChange={e => setFormData({...formData, seed_count: e.target.value})}
                     />
                  </div>
               </div>
            </div>
            
            <div className="field-row">
               <div className="form-group">
                  <label>{terms.seedDateLabel}</label>
                  <div className="input-field">
                     <input 
                        type="date" required 
                        value={formData.seed_date} onChange={e => setFormData({...formData, seed_date: e.target.value})}
                     />
                  </div>
               </div>
               <div className="form-group">
                  <label>Estimasi Panen</label>
                  <div className="input-field">
                     <input 
                        type="date"
                        value={formData.expected_harvest_date} onChange={e => setFormData({...formData, expected_harvest_date: e.target.value})}
                     />
                  </div>
               </div>
            </div>
 
            <div className="modal-footer" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
               <button type="button" className="btn btn-secondary flex-1" onClick={() => setModalOpen(false)}>Kembali</button>
               <LoadingButton loading={saving} type="submit" className="btn btn-primary flex-2">{terms.startCycleAction}</LoadingButton>
            </div>
         </form>
       </Modal>

      <style>{`
        .premium-cycles { padding-bottom: 60px; }
        
        .cycles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        .premium-cycle-card {
           background: var(--bg-card); padding: 32px; border-radius: 32px; border: 1px solid var(--border-subtle); cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
        }
        .premium-cycle-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--accent-500); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .p-name { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
        .p-area { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); font-weight: 500; }
        
        .doc-glimmer {
           background: var(--accent-50); padding: 8px 14px; border-radius: 14px; text-align: center; border: 1px solid var(--accent-100);
        }
        .doc-num { display: block; font-size: 20px; font-weight: 700; color: var(--accent-600); line-height: 1; }
        .doc-txt { font-size: 10.5px; font-weight: 600; color: var(--accent-500); }

        .stats-row { display: flex; gap: 24px; margin-bottom: 32px; }
        .s-item { flex: 1; }
        .s-label { display: block; font-size: 11.5px; font-weight: 500; color: var(--text-muted); margin-bottom: 4px; }
        .s-val { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .s-val small { font-size: 11px; color: var(--text-muted); font-weight: 500; }

        .progress-section { margin-bottom: 32px; }
        .p-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
        .p-rail { height: 8px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; }
        
        .card-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 24px; }
        .status-indicator {
           display: flex; align-items: center; gap: 8px; background: var(--success-50); color: var(--success-600); padding: 6px 14px; border-radius: 40px; font-size: 12px; font-weight: 600;
        }
        .pulse-dot { width: 8px; height: 8px; background: var(--success-500); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse {
           0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
           70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
           100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .btn-detail-circle {
           width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--text-muted); background: var(--bg-card); transition: 0.2s;
        }
        .premium-cycle-card:hover .btn-detail-circle {
           background: var(--text-primary); color: var(--bg-card); border-color: var(--text-primary); transform: scale(1.1);
        }

        .premium-form-modern .form-group { margin-bottom: 24px; }
        .premium-form-modern label { display: block; font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
        .input-field { position: relative; background: var(--bg-elevated); border: 2px solid var(--border-subtle); border-radius: 16px; padding: 12px 18px; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .input-field:focus-within { border-color: var(--accent-500); background: var(--bg-card); box-shadow: var(--shadow-sm); }
        .input-field input, .input-field select { width: 100%; border: none; background: transparent; outline: none; font-size: 15px; font-weight: 700; color: var(--text-primary); }
        
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      `}</style>
    </div>
  )
}
