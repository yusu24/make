import React, { useState, useEffect } from 'react';
import { Eye, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import KulinerReceiptModal from '../components/KulinerReceiptModal';
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
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    fetchOrders(true); // initial load = show spinner
    const interval = setInterval(() => fetchOrders(false), 30000); // Auto refresh every 30s (no spinner)
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
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
      fetchOrders(false);
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

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;

    const printContent = `
      <html>
      <head>
        <title>Struk Pesanan - ${selectedOrder.order_number || `#ORD-${selectedOrder.id}`}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            margin: 0; 
            padding: 10px; 
            width: 80mm; 
            color: #000;
            background: #fff;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .text-sm { font-size: 14px; }
          .text-xs { font-size: 12px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mt-2 { margin-top: 8px; }
          .pb-2 { padding-bottom: 8px; }
          .border-b { border-bottom: 1px dashed #000; }
          .border-t { border-top: 1px dashed #000; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .w-full { width: 100%; }
        </style>
      </head>
      <body>
        <div class="text-center font-bold" style="font-size: 16px; margin-bottom: 5px;">${(user?.tenant_name || 'STRUK PEMBELIAN').toUpperCase()}</div>
        <div class="text-center text-xs mb-2 border-b pb-2">Struk Pembelian</div>
        
        <div class="text-xs mb-2 mt-2">
          <div class="flex justify-between mb-1">
            <span>No: ${selectedOrder.order_number || '#ORD-' + selectedOrder.id}</span>
            <span>${new Date(selectedOrder.created_at).toLocaleDateString()}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span>Kasir: ${user?.name || 'Admin'}</span>
            <span>${new Date(selectedOrder.created_at).toLocaleTimeString()}</span>
          </div>
          <div class="mb-1">Pelanggan: ${selectedOrder.customer_name}</div>
          <div>Tipe: ${selectedOrder.order_type === 'dine_in' ? 'Dine In (Meja ' + (selectedOrder.table_number || '-') + ')' : 'Takeaway'}</div>
        </div>
        
        <div class="border-t border-b mt-2 mb-2" style="padding: 5px 0;">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            ${selectedOrder.items?.map(item => `
              <tr>
                <td colspan="3" class="font-bold">${item.name}</td>
              </tr>
              <tr>
                <td style="width: 15%;">${item.qty}x</td>
                <td style="width: 35%;">${formatRp(item.price)}</td>
                <td style="width: 50%;" class="text-right">${formatRp(item.price * item.qty)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="text-sm font-bold flex justify-between mt-2">
          <span>Total</span>
          <span>${formatRp(selectedOrder.total)}</span>
        </div>
        <div class="text-xs flex justify-between mt-1">
          <span>Metode Bayar</span>
          <span>${selectedOrder.payment_method === 'cash_cashier' ? 'Tunai Kasir' : 'QRIS Kasir'}</span>
        </div>
        
        <div class="text-center text-xs mt-2 border-t" style="padding-top: 10px;">
          Terima kasih atas kunjungan Anda!
        </div>
      </body>
      </html>
    `;

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = 'none';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 1000);
    }, 250);
  };

  return (
    <KulinerAdminLayout>
      {/* Topbar selalu tampil, tidak ikut loading */}
      <div className="kd-topbar">
        <h1 className="kd-page-title">Manajemen Pesanan</h1>
      </div>

      {/* Hanya konten yang loading */}
      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memuat Pesanan..." />
        ) : (
          <>
            <div className="kd-page-actions">
              <button className="kd-btn kd-btn-primary" onClick={() => navigate(`/kuliner/menu?mode=cashier&tenant_id=${user?.tenant_id}`)}>
                + Buat Pesanan Manual
              </button>
            </div>
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
                <button className="kd-panel-action" onClick={() => fetchOrders(false)}>Refresh Data ↻</button>
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
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-10 text-slate-400">Belum ada pesanan.</td></tr>
                    ) : filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <span className="font-bold text-[#b48c36]">{order.order_number || `#ORD-${order.id}`}</span>
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
                        <td className="font-bold text-slate-700">{formatRp(order.total)}</td>
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
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="kd-icon-btn"
                              title="Detail / Proses"
                              onClick={() => { setSelectedOrder(order); setIsModalOpen(true); setIsPaymentMode(false); setCashReceived(''); }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="kd-icon-btn"
                              title="Struk"
                              onClick={() => setReceiptOrder(order)}
                            >
                              <Receipt size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ORDER DETAIL MODAL */}
            {isModalOpen && selectedOrder && (
              <div className="kd-modal-overlay visible" onClick={() => { setIsModalOpen(false); setIsPaymentMode(false); setCashReceived(''); }}>
                <div className="kd-modal" onClick={e => e.stopPropagation()}>
                  <div className="kd-modal-header">
                    <h2 className="kd-modal-title">Pesanan {selectedOrder.order_number || `#ORD-${selectedOrder.id}`}</h2>
                    <button className="kd-close-btn" onClick={() => { setIsModalOpen(false); setIsPaymentMode(false); setCashReceived(''); }}>✕</button>
                  </div>
                  <div className="kd-modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 mb-2">Informasi Pelanggan</h4>
                        <p className="font-bold text-slate-800">{selectedOrder.customer_name}</p>
                        <p className="text-sm text-slate-500">{selectedOrder.customer_phone}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {selectedOrder.order_type === 'dine_in' ? `Makan di Tempat (Meja ${selectedOrder.table_number})` : 'Bawa Pulang'}
                        </p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-xs font-bold text-slate-400 mb-2">Status Pembayaran</h4>
                        <p className={`font-bold ${selectedOrder.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                          {selectedOrder.status === 'pending' ? 'Belum lunas' : selectedOrder.status}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedOrder.payment_method === 'cash_cashier' ? 'Metode: Tunai di Kasir' : 'Metode: QRIS di Kasir'}
                        </p>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20 }}>
                      <h4 className="text-xs font-bold text-slate-400 mb-4">Rincian Menu</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-slate-100 text-sm">{item.qty}x</div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                <p className="text-[11px] text-slate-400">{formatRp(item.price)}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-slate-800">{formatRp(item.price * item.qty)}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px dashed #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-lg font-bold text-slate-800">Total Akhir</span>
                          <span className="text-lg font-extrabold text-[#b48c36]">{formatRp(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div style={{ marginTop: 16, padding: 12, background: '#fff9e6', borderRadius: 10, border: '1px solid #ffeeba' }}>
                        <p className="text-[11px] font-bold text-amber-700 mb-1">Catatan Pelanggan:</p>
                        <p className="text-xs text-amber-800 italic">"{selectedOrder.notes}"</p>
                      </div>
                    )}
                    {isPaymentMode && (
                      <div style={{ marginTop: 20, padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                        <h4 className="text-sm font-bold text-green-800 mb-3">Proses Pembayaran Tunai</h4>
                        <div className="kd-form-group" style={{ marginBottom: 12 }}>
                          <label className="kd-form-label" style={{ color: '#15803d' }}>Nominal Uang Diterima</label>
                          <input 
                            type="number" 
                            className="kd-form-input" 
                            value={cashReceived} 
                            onChange={(e) => setCashReceived(e.target.value)}
                            placeholder="Contoh: 50000"
                            style={{ borderColor: '#86efac' }}
                            autoFocus
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <span className="text-sm font-bold text-green-800">Kembalian:</span>
                          <span className="text-xl font-extrabold text-green-600">
                            {formatRp(Math.max(0, (parseInt(cashReceived) || 0) - selectedOrder.total))}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="kd-btn kd-btn-secondary" 
                            style={{ flex: 1 }}
                            onClick={() => setIsPaymentMode(false)}
                          >
                            Batal
                          </button>
                          <button 
                            className="kd-btn kd-btn-primary" 
                            style={{ flex: 1, background: '#16a34a' }}
                            disabled={(parseInt(cashReceived) || 0) < selectedOrder.total}
                            onClick={() => {
                              updateOrderStatus(selectedOrder.id, 'processing');
                              setIsPaymentMode(false);
                            }}
                          >
                            Selesaikan Pembayaran
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!isPaymentMode && (
                    <div className="kd-modal-footer" style={{ gap: 8 }}>
                      {selectedOrder.status === 'pending' && (
                        <button
                          className="kd-btn kd-btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            if (selectedOrder.payment_method === 'cash_cashier') {
                              setIsPaymentMode(true);
                            } else {
                              updateOrderStatus(selectedOrder.id, 'processing');
                            }
                          }}
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
                      <button className="kd-btn kd-btn-secondary" style={{ flex: 1 }} onClick={handlePrintReceipt}>
                        🖨️ Cetak Struk
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <KulinerReceiptModal
        isOpen={!!receiptOrder}
        order={receiptOrder}
        storeName={user?.tenant_name}
        onClose={() => setReceiptOrder(null)}
      />
    </KulinerAdminLayout>
  );
};

export default KulinerOrders;