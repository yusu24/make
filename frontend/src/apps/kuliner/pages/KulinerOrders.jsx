import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

import { useAuth } from '../../../contexts/AuthContext';

const KulinerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/kuliner/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/kuliner/admin/orders/${id}/status`, { status });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (error) {
      alert('Gagal memperbarui status pesanan');
    }
  };

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(n));
  };

  const filteredOrders = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'kd-status-draft';
      case 'processing': return 'kd-status-active';
      case 'completed': return 'kd-status-active bg-green-100 text-green-700';
      case 'cancelled': return 'kd-status-hidden';
      default: return '';
    }
  };

  return (
    <KulinerAdminLayout>
      {loading ? (
        <KulinerLoading message="Memuat Pesanan..." />
      ) : (
        <>
          <div className="kd-topbar">
            <h1 className="kd-page-title">Manajemen Pesanan</h1>
            <div className="kd-topbar-actions">
              <button className="kd-btn kd-btn-primary" onClick={() => navigate(`/kuliner/menu?mode=cashier&tenant_id=${user?.tenant_id}`)}>
                + Buat Pesanan Manual
              </button>
            </div>
          </div>

          <div className="kd-content">
            <div className="kd-panel">
              <div className="kd-panel-header">
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    className={`kd-btn ${filterStatus === 'all' ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                    onClick={() => setFilterStatus('all')}
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    Semua
                  </button>
                  <button 
                    className={`kd-btn ${filterStatus === 'pending' ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                    onClick={() => setFilterStatus('pending')}
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    Menunggu Verifikasi
                  </button>
                  <button 
                    className={`kd-btn ${filterStatus === 'processing' ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                    onClick={() => setFilterStatus('processing')}
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    Dalam Proses
                  </button>
                </div>
                <button className="kd-panel-action" onClick={fetchOrders}>Refresh Data ↻</button>
              </div>

              <div className="kd-table-container">
                <table className="kd-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Pelanggan</th>
                      <th>Tipe</th>
                      <th>Total Tagihan</th>
                      <th>Status</th>
                      <th>Metode Bayar</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <span className="font-bold text-[#b48c36]">{order.order_number}</span>
                          <div className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleTimeString()}</div>
                        </td>
                        <td>
                          <div className="kd-menu-name">{order.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{order.customer_phone}</div>
                        </td>
                        <td>
                          <span className="text-[11px] font-bold tracking-wider text-slate-500">
                            {order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Bawa Pulang'}
                          </span>
                        </td>
                        <td className="font-bold text-slate-700">{formatRp(order.total_amount)}</td>
                        <td>
                          <span className={`kd-status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className="text-[11px] text-slate-500">
                            {order.payment_method === 'cash_cashier' ? '💵 Tunai Kasir' : '📱 QRIS Kasir'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button 
                            className="kd-btn kd-btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: 11 }}
                            onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                          >
                            Detail / Proses
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ORDER DETAIL MODAL */}
          {isModalOpen && selectedOrder && (
            <div className="kd-modal-overlay visible" onClick={() => setIsModalOpen(false)}>
              <div className="kd-modal" onClick={e => e.stopPropagation()}>
                <div className="kd-modal-header">
                  <h2 className="kd-modal-title">Pesanan {selectedOrder.order_number}</h2>
                  <button className="kd-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                </div>
                <div className="kd-modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 mb-2">Informasi Pelanggan</h4>
                      <p className="font-bold text-slate-800">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-slate-500">{selectedOrder.customer_phone}</p>
                      <p className="text-sm text-slate-500 mt-1">{selectedOrder.order_type === 'dine_in' ? `Makan di Tempat (Meja ${selectedOrder.table_number})` : 'Bawa Pulang'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-slate-400 mb-2">Status Pembayaran</h4>
                      <p className={`font-bold ${selectedOrder.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedOrder.status === 'pending' ? 'Belum lunas' : selectedOrder.status}
                      </p>
                      <p className="text-sm text-slate-500">{selectedOrder.payment_method === 'cash_cashier' ? 'Metode: Tunai di Kasir' : 'Metode: QRIS di Kasir'}</p>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20 }}>
                    <h4 className="text-xs font-bold text-slate-400 mb-4">Rincian Menu</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-slate-100 text-sm">{item.quantity}x</div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{item.name}</p>
                              <p className="text-[11px] text-slate-400">{formatRp(item.price)}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-800">{formatRp(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className="text-sm text-slate-500">Subtotal</span>
                        <span className="text-sm font-bold text-slate-800">{formatRp(selectedOrder.total_amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-lg font-bold text-slate-800">Total Akhir</span>
                        <span className="text-lg font-extrabold text-[#b48c36]">{formatRp(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div style={{ marginTop: 16, padding: 12, background: '#fff9e6', borderRadius: 10, border: '1px solid #ffeeba' }}>
                      <p className="text-[11px] font-bold text-amber-700 mb-1">Catatan Pelanggan:</p>
                      <p className="text-xs text-amber-800 italic">"{selectedOrder.notes}"</p>
                    </div>
                  )}
                </div>
                <div className="kd-modal-footer" style={{ gap: 8 }}>
                  {selectedOrder.status === 'pending' && (
                    <button 
                      className="kd-btn kd-btn-primary" 
                      style={{ flex: 1 }}
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                    >
                      💵 Verifikasi & Terima Pembayaran
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button 
                      className="kd-btn kd-btn-primary" 
                      style={{ flex: 1, background: '#10b981' }}
                      onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    >
                      ✅ Tandai Selesai (Sajikan)
                    </button>
                  )}
                  <button className="kd-btn kd-btn-secondary" style={{ flex: 1 }} onClick={() => window.print()}>
                    🖨️ Cetak Struk
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </KulinerAdminLayout>
  );
};

export default KulinerOrders;
