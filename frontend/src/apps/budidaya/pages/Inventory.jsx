import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton, EmptyState } from '../components/UXComponents'

const CATEGORIES = ['Semua', 'Pakan', 'Bibit', 'Obat', 'Peralatan', 'Lainnya']
const UNITS = ['kg', 'gram', 'liter', 'ml', 'ekor', 'pcs', 'zak', 'botol', 'box', 'karung']

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '', category: 'Pakan', stock: 0, unit: 'kg', min_stock: 0, price_per_unit: 0, description: ''
  })
  const [stockData, setStockData] = useState({ type: 'in', quantity: '', note: '' })
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
      setFormData({ name: '', category: 'Pakan', stock: 0, unit: 'kg', min_stock: 0, price_per_unit: 0, description: '' })
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
      setStockData({ type: 'in', quantity: '', note: '' })
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
    background: '#fff', borderRadius: '24px', padding: '24px',
    border: '1px solid #E9F0EC'
  }

  const getStockStatus = (item) => {
    if (item.stock <= 0) return { label: 'Habis', color: '#EF4444', bg: '#FEE2E2' }
    if (item.stock <= item.min_stock) return { label: 'Menipis', color: '#F59E0B', bg: '#FEF3C7' }
    return { label: 'Aman', color: '#059669', bg: '#D1FAE5' }
  }

  return (
    <div className="aq-container">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="aq-page-title">Gudang & inventaris</h1>

        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => { setSelectedItem(null); setStockData({ type: 'in', quantity: '', note: 'Penerimaan barang' }); setShowReceiveModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
            Penerimaan Barang
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => { setSelectedItem(null); setFormData({ name: '', category: 'Pakan', stock: 0, unit: 'kg', min_stock: 0, price_per_unit: 0, description: '' }); setShowModal(true) }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            Tambah Barang
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="aq-grid-4">
        {[
          { label: 'Total barang', val: items.length, icon: 'inventory', bg: '#E8F5ED', color: '#1B4332' },
          { label: 'Stok menipis', val: items.filter(i => i.stock <= i.min_stock && i.stock > 0).length, icon: 'warning', bg: '#FEF3C7', color: '#F59E0B' },
          { label: 'Stok habis', val: items.filter(i => i.stock <= 0).length, icon: 'error', bg: '#FEE2E2', color: '#EF4444' },
          { label: 'Nilai asset', val: `Rp ${(items.reduce((acc, i) => acc + (i.stock * i.price_per_unit), 0)).toLocaleString()}`, icon: 'payments', bg: '#E0E7FF', color: '#4F46E5' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{s.icon}</span>
              </div>
              <div>
                <p className="aq-kpi-label">{s.label}</p>
                <h2 className="aq-kpi-value" style={{ fontSize: '18px' }}>{s.val}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Content */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                  background: category === cat ? '#1B4332' : '#F1F5F9',
                  color: category === cat ? '#fff' : '#475569',
                  fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}
              >{cat}</button>
            ))}
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '18px' }}>search</span>
            <input 
              placeholder="Cari barang..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#F1F5F9', border: 'none', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat data gudang...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '20px', border: '1px dashed #E2E8F0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#CBD5E1' }}>inventory_2</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#475569', marginTop: '16px' }}>Belum ada barang</h3>
            <p style={{ color: '#64748B', fontSize: '14px' }}>Mulai tambahkan pakan atau peralatan ke gudang Anda.</p>
          </div>
        ) : (
          <div className="aq-table-container">
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell>Nama barang</TableHeaderCell>
                  <TableHeaderCell>Kategori</TableHeaderCell>
                  <TableHeaderCell>Stok</TableHeaderCell>
                  <TableHeaderCell>Satuan</TableHeaderCell>
                  <TableHeaderCell>Harga satuan</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => {
                  const status = getStockStatus(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <h4 className="aq-body-text" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--aq-text-primary)', margin: 0 }}>{item.name}</h4>
                      </TableCell>
                      <TableCell>
                        <span className="aq-small-text" style={{ fontSize: '13px', textTransform: 'capitalize', fontWeight: 600, color: '#64748B' }}>{item.category}</span>
                      </TableCell>
                      <TableCell>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1B4332', margin: 0 }}>{parseFloat(item.stock).toLocaleString()}</h4>
                      </TableCell>
                      <TableCell>
                        <span className="aq-small-text" style={{ fontSize: '13px', textTransform: 'capitalize', fontWeight: 600, color: '#64748B' }}>{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontWeight: 600, color: 'var(--aq-text-primary)', fontSize: '14px' }}>
                          Rp {parseFloat(item.price_per_unit).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: 700, 
                          background: status.bg, color: status.color, textTransform: 'none' 
                        }}>{status.label}</span>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            title="Update Stok"
                            onClick={() => { setSelectedItem(item); setStockData({ type: 'in', quantity: '', note: '' }); setShowStockModal(true) }}
                            style={{ 
                              width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#D8F3DC', 
                              color: '#1B4332', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sync_alt</span>
                          </button>
                          <button 
                            title="Edit Barang"
                            onClick={() => { setSelectedItem(item); setFormData({ ...item }); setShowModal(true) }}
                            style={{ 
                              width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #E9F0EC', background: '#fff', 
                              color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button 
                            title="Hapus Barang"
                            onClick={() => handleDelete(item.id)}
                            style={{ 
                              width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #FEE2E2', background: '#fff', 
                              color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
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

      {/* Item Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '500px', maxWidth: '90vw', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 28px 20px',
              borderBottom: '1px solid #E9F0EC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#D8F3DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B4332' }}>inventory_2</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>{selectedItem ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0, marginTop: 2 }}>Kelola stok dan detail inventaris gudang</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#F4F7F5', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Nama Barang</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }}>
                    {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Satuan</label>
                  <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {!selectedItem && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Stok Awal</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Minimal Stok</label>
                  <input type="number" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Harga Beli Satuan (Rp)</label>
                <input type="number" value={formData.price_per_unit} onChange={e => setFormData({ ...formData, price_per_unit: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <LoadingButton loading={saving} type="submit" className="btn btn-primary" style={{ flex: 2 }}>
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
          <div style={{ background: '#fff', borderRadius: '24px', width: '400px', maxWidth: '90vw', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid #E9F0EC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: '#E8F5ED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#1B4332' }}>sync_alt</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>Update Stok</h3>
                  <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{selectedItem?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: '#F4F7F5', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleStockSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Tipe Transaksi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setStockData({ ...stockData, type: 'in' })} 
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #E9F0EC', background: stockData.type === 'in' ? '#D1FAE5' : '#fff', color: stockData.type === 'in' ? '#059669' : '#475569', fontWeight: '700', cursor: 'pointer' }}>Barang Masuk</button>
                  <button type="button" onClick={() => setStockData({ ...stockData, type: 'out' })} 
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #E9F0EC', background: stockData.type === 'out' ? '#FEE2E2' : '#fff', color: stockData.type === 'out' ? '#EF4444' : '#475569', fontWeight: '700', cursor: 'pointer' }}>Barang Keluar</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Jumlah ({selectedItem?.unit})</label>
                <input type="number" step="0.01" required value={stockData.quantity} onChange={e => setStockData({ ...stockData, quantity: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Catatan</label>
                <input value={stockData.note} onChange={e => setStockData({ ...stockData, note: e.target.value })} placeholder="Contoh: Pembelian baru, Pakan harian"
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Batal</button>
                <LoadingButton loading={saving} type="submit" className="btn btn-primary" style={{ flex: 2 }}>
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
          <div style={{ background: '#fff', borderRadius: '24px', width: '450px', maxWidth: '90vw', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 28px 20px',
              borderBottom: '1px solid #E9F0EC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#E8F5ED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B4332' }}>download</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>Penerimaan Barang</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0, marginTop: 2 }}>Catat masuknya stok barang ke gudang</p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiveModal(false)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#F4F7F5', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleStockSubmit} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Pilih Barang</label>
                <select 
                  required
                  value={selectedItem?.id || ''} 
                  onChange={e => setSelectedItem(items.find(i => i.id == e.target.value))}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="">-- Pilih Barang di Gudang --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.category}) - Stok: {item.stock} {item.unit}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Jumlah Masuk</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" step="0.01" required 
                      value={stockData.quantity} 
                      onChange={e => setStockData({ ...stockData, quantity: e.target.value })}
                      placeholder="0.00"
                      style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} 
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
                      {selectedItem?.unit || ''}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Tgl. Terima</label>
                  <input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Catatan / Supplier</label>
                <textarea 
                  value={stockData.note} 
                  onChange={e => setStockData({ ...stockData, note: e.target.value })}
                  placeholder="Contoh: Pembelian dari Supplier A, No. Faktur: 123..."
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '12px', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReceiveModal(false)} style={{ flex: 1 }}>Batal</button>
                <LoadingButton 
                  loading={saving} 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!selectedItem}
                  style={{ flex: 2 }}
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
