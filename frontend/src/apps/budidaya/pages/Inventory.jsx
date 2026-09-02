import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton, EmptyState } from '../components/UXComponents'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'
import CurrencyInput from '../../../components/CurrencyInput'
import usePagination from '../../../hooks/usePagination'
import BudidayaPagination from '../components/BudidayaPagination'

const UNITS = ['kg', 'gram', 'liter', 'ml', 'ekor', 'pcs', 'zak', 'botol', 'box', 'karung']

export default function Inventory() {
  const terms = useBudidayaTerms()
  const CATEGORIES = terms.inventoryCategories
  const defaultCat = terms.defaultInventoryCategory

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '', category: defaultCat, stock: 0, unit: 'kg', min_stock: 0, price_per_unit: 0, description: ''
  })
  const [stockData, setStockData] = useState({ type: 'in', quantity: '', note: '', total_cost: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [category, search])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/inventory', {
        params: { category, search }
      })
      setItems(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
  } = usePagination(items)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (selectedItem) {
        await api.put(`/budidaya/inventory/${selectedItem.id}`, formData)
      } else {
        await api.post('/budidaya/inventory', formData)
      }
      setShowModal(false)
      setSelectedItem(null)
      setFormData({ name: '', category: defaultCat, stock: 0, unit: 'kg', min_stock: 0, price_per_unit: 0, description: '' })
      fetchItems()
      alert('Berhasil menyimpan data barang')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleStockSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/budidaya/inventory/${selectedItem.id}/stock`, stockData)
      setShowStockModal(false)
      setShowReceiveModal(false)
      setStockData({ type: 'in', quantity: '', note: '', total_cost: 0 })
      fetchItems()
      alert('Stok berhasil diperbarui')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui stok')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus barang ini?')) return
    try {
      await api.delete(`/budidaya/inventory/${id}`)
      fetchItems()
    } catch (err) {
      alert('Gagal menghapus barang')
    }
  }

  const cardStyle = {
    background: '#ffffff', 
    borderRadius: '16px', 
    padding: '16px 20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  }

  const getStockStatus = (item) => {
    if (item.stock <= 0) return { label: 'Habis', color: '#EF4444', bg: '#FEE2E2' }
    if (item.stock <= item.min_stock) return { label: 'Menipis', color: '#F59E0B', bg: '#FEF3C7' }
    return { label: 'Aman', color: '#059669', bg: '#D1FAE5' }
  }

  return (
    <div className="aq-container" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div></div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => { setSelectedItem(null); setStockData({ type: 'in', quantity: '', note: terms.stockReceiveNote, total_cost: 0 }); setShowReceiveModal(true) }}
            style={{ height: '38px', padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            <span>Penerimaan Barang</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => { setSelectedItem(null); setFormData({ name: '', category: defaultCat, stock: 0, unit: 'kg', min_stock: 0, price_per_unit: 0, description: '' }); setShowModal(true) }}
            style={{ height: '38px', padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="aq-grid-4">
        {[
          { label: 'Total Barang', val: items.length, icon: 'inventory', bg: '#E8F5ED', color: '#1B4332' },
          { label: 'Stok Menipis', val: items.filter(i => i.stock <= i.min_stock && i.stock > 0).length, icon: 'warning', bg: '#FEF3C7', color: '#F59E0B' },
          { label: 'Stok Habis', val: items.filter(i => i.stock <= 0).length, icon: 'error', bg: '#FEE2E2', color: '#EF4444' },
          { label: 'Nilai Aset', val: `Rp ${(items.reduce((acc, i) => acc + (i.stock * i.price_per_unit), 0)).toLocaleString()}`, icon: 'payments', bg: '#E0E7FF', color: '#4F46E5' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, shrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon}</span>
              </div>
              <div>
                <p className="aq-kpi-label">{s.label}</p>
                <h2 className="aq-kpi-value">{s.val}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Content */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '18px', pointerEvents: 'none' }}>category</span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 34px',
                  background: '#ffffff',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'Semua' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '16px', pointerEvents: 'none' }}>expand_more</span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '18px' }}>search</span>
            <input 
              placeholder="Cari barang..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', background: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Memuat data gudang...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#CBD5E1' }}>inventory_2</span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginTop: '12px' }}>Belum ada barang</h3>
            <p style={{ color: '#64748B', fontSize: '13px' }}>{terms.emptyInventoryDesc}</p>
          </div>
        ) : (
          <>
            <Table style={{ marginBottom: 0 }}>
            <TableHeader>
              <TableRow isHoverable={false}>
                <TableHeaderCell>Nama Barang</TableHeaderCell>
                <TableHeaderCell>Kategori</TableHeaderCell>
                <TableHeaderCell>Stok</TableHeaderCell>
                <TableHeaderCell>Satuan</TableHeaderCell>
                <TableHeaderCell>Harga Satuan</TableHeaderCell>
                <TableHeaderCell>Total Nilai</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedData.map(item => {
                  const status = getStockStatus(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div style={{ fontSize: '13px', color: '#0f172a' }}>{item.name}</div>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontSize: '12px', textTransform: 'capitalize', color: '#64748B' }}>{item.category}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontSize: '13px', color: '#0f172a' }}>{parseFloat(item.stock).toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontSize: '12px', textTransform: 'capitalize', color: '#64748B' }}>{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: '#334155', fontSize: '12.5px' }}>
                          Rp {parseFloat(item.price_per_unit).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: '#1B4332', fontSize: '12.5px' }}>
                          Rp {(parseFloat(item.stock) * parseFloat(item.price_per_unit || 0)).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="badge-pill" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div className="table-row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-table-action"
                            title="Update Stok"
                            onClick={() => { setSelectedItem(item); setStockData({ type: 'in', quantity: '', note: '', total_cost: 0 }); setShowStockModal(true) }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sync_alt</span>
                          </button>
                          <button 
                            className="btn-table-action"
                            title="Edit Barang"
                            onClick={() => { setSelectedItem(item); setFormData({ ...item }); setShowModal(true) }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          </button>
                          <button 
                            className="btn-table-action"
                            title="Hapus Barang"
                            onClick={() => handleDelete(item.id)}
                            style={{ color: '#ef4444' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
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

      {/* Item Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', width: '500px', maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: "'Inter', sans-serif" }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: '#E8F5ED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#1B4332' }}>inventory_2</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>{selectedItem ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, marginTop: 2 }}>Kelola stok dan detail inventaris gudang</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: '#F1F5F9', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Nama Barang</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}>
                    {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Satuan</label>
                  <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {!selectedItem && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Stok Awal</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Minimal Stok</label>
                  <input type="number" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Harga Beli Satuan (Rp)</label>
                <CurrencyInput value={formData.price_per_unit} onChange={e => setFormData({ ...formData, price_per_unit: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>Batal</button>
                <LoadingButton loading={saving} type="submit" className="btn btn-primary" style={{ flex: 2, padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
                  {selectedItem ? 'Simpan Perubahan' : 'Tambah Barang'}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', width: '400px', maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: "'Inter', sans-serif" }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#E8F5ED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1B4332' }}>sync_alt</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Update Stok</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0 }}>{selectedItem?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: '#F1F5F9', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleStockSubmit} style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Tipe Transaksi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setStockData({ ...stockData, type: 'in' })} 
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', background: stockData.type === 'in' ? '#D1FAE5' : '#fff', color: stockData.type === 'in' ? '#059669' : '#475569', fontWeight: '600', fontSize: '12.5px', cursor: 'pointer' }}>Barang Masuk</button>
                  <button type="button" onClick={() => setStockData({ ...stockData, type: 'out' })} 
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', background: stockData.type === 'out' ? '#FEE2E2' : '#fff', color: stockData.type === 'out' ? '#EF4444' : '#475569', fontWeight: '600', fontSize: '12.5px', cursor: 'pointer' }}>Barang Keluar</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Jumlah ({selectedItem?.unit})</label>
                <input type="number" step="0.01" required value={stockData.quantity} onChange={e => setStockData({ ...stockData, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Catatan</label>
                <input value={stockData.note} onChange={e => setStockData({ ...stockData, note: e.target.value })} placeholder={terms.stockNotePlaceholder}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>Batal</button>
                <LoadingButton loading={saving} type="submit" className="btn btn-primary" style={{ flex: 2, padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
                  Simpan Stok
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal (Penerimaan Barang) */}
      {showReceiveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', width: '450px', maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: "'Inter', sans-serif" }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: '#E8F5ED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#1B4332' }}>download</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Penerimaan Barang</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, marginTop: 2 }}>Catat masuknya stok barang ke gudang</p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiveModal(false)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: '#F1F5F9', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handleStockSubmit} style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Pilih Barang</label>
                <select 
                  required
                  value={selectedItem?.id || ''} 
                  onChange={e => setSelectedItem(items.find(i => i.id == e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="">-- Pilih Barang di Gudang --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.category}) - Stok: {item.stock} {item.unit}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Jumlah Masuk</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" step="0.01" required 
                      value={stockData.quantity} 
                      onChange={e => setStockData({ ...stockData, quantity: e.target.value })}
                      placeholder="0.00"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} 
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '12px', fontWeight: 500 }}>
                      {selectedItem?.unit || ''}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Tgl. Terima</label>
                  <input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block', marginBottom: '4px' }}>Catatan / Supplier</label>
                <textarea 
                  value={stockData.note} 
                  onChange={e => setStockData({ ...stockData, note: e.target.value })}
                  placeholder="Contoh: Pembelian dari Supplier A, No. Faktur: 123..."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none', minHeight: '70px', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReceiveModal(false)} style={{ flex: 1, padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>Batal</button>
                <LoadingButton 
                  loading={saving} 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!selectedItem}
                  style={{ flex: 2, padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                >
                  Simpan Penerimaan
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
