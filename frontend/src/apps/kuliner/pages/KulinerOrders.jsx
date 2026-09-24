import React, { useState, useEffect } from 'react';
import {
  Eye,
  Receipt,
  Banknote,
  Smartphone,
  CheckCircle2,
  Printer,
  ChefHat,
  X,
  RefreshCw
} from '@/constants/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import KulinerReceiptModal from '../components/KulinerReceiptModal';
import ClientPagination from '../components/ClientPagination';
import './KulinerDashboard.css';

import { useAuth } from '../../../contexts/AuthContext';

const KulinerOrders = () => {
  const { t } = useTranslation();
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <span>{t('kulinerCommon.paymentMethod') || 'Metode Bayar'}</span>
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

  const handlePrintKitchenReceipt = () => {
    if (!selectedOrder) return;

    const printContent = `
      <html>
      <head>
        <title>Checker Dapur - ${selectedOrder.order_number || `#ORD-${selectedOrder.id}`}</title>
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
          .font-bold { font-weight: bold; }
          .text-lg { font-size: 18px; }
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
        <div class="text-center font-bold text-lg mb-1">DAPUR</div>
        <div class="text-center text-xs mb-2 border-b pb-2">Pesanan Masuk</div>
        
        <div class="text-xs mb-2 mt-2">
          <div class="flex justify-between mb-1">
            <span class="font-bold">No: ${selectedOrder.order_number || '#ORD-' + selectedOrder.id}</span>
            <span>${new Date(selectedOrder.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div class="mb-1">Pelanggan: ${selectedOrder.customer_name}</div>
          <div class="font-bold text-sm mb-1">Tipe: ${selectedOrder.order_type === 'dine_in' ? 'DINE IN (Meja ' + (selectedOrder.table_number || '-') + ')' : 'TAKEAWAY'}</div>
          ${selectedOrder.notes ? `<div class="mb-1" style="font-weight:bold; color: #d97706;">Catatan: ${selectedOrder.notes}</div>` : ''}
        </div>
        
        <div class="border-t border-b mt-2 mb-2" style="padding: 5px 0;">
          <table class="w-full text-sm" style="border-collapse: collapse;">
            ${selectedOrder.items?.map(item => `
              <tr>
                <td style="width: 15%; vertical-align: top;" class="font-bold">${item.qty}x</td>
                <td style="width: 85%; padding-bottom: 5px;">
                  <span class="font-bold">${item.name}</span>
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="text-center text-xs mt-2" style="padding-top: 10px;">
          *** HARAP SEGERA DISIAPKAN ***
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
        <h1 className="kd-page-title">{t('kulinerOrders.ordersTitle')}</h1>
      </div>

      {/* Hanya konten yang loading */}
      <div className="kd-content">
        {loading ? (
          <KulinerLoading message={t('kulinerOrders.loadingOrders') || 'Memuat Pesanan...'} />
        ) : (
          <>
            <div className="kd-page-actions" style={{ marginBottom: 16 }}>
              <button 
                className="h-[38px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                onClick={() => navigate(`/kuliner/menu?mode=cashier&tenant_id=${user?.tenant_id}`)}
              >
                <span>+ Buat Pesanan Manual</span>
              </button>
            </div>
            <div className="kd-panel">
              <div className="kd-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className={`h-[38px] px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                  >
                    {t('kulinerOrders.tabAll')}
                  </button>
                  <button
                    className={`h-[38px] px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'pending' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
                  >
                    {t('kulinerOrders.tabNew') || 'Baru / Menunggu'}
                  </button>
                  <button
                    className={`h-[38px] px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'processing' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    onClick={() => { setFilterStatus('processing'); setCurrentPage(1); }}
                  >
                    {t('kulinerOrders.tabProcess') || 'Dalam Proses'}
                  </button>
                </div>
                <button 
                  className="h-[38px] px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer" 
                  onClick={() => fetchOrders(false)}
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
                  <span>{t('kulinerOrders.refreshData') || 'Refresh Data'}</span>
                </button>
              </div>

              <div className="kd-table-container" style={{ overflowX: 'auto' }}>
                <table className="kd-table">
                  <thead>
                    <tr>
                      <th className="pl-6">{t('kulinerOrders.headerId') || 'Order ID'}</th>
                      <th>{t('kulinerOrders.headerDate') || 'Tanggal'}</th>
                      <th>{t('kulinerOrders.headerCustomer') || 'Pelanggan'}</th>
                      <th>No HP</th>
                      <th>Tipe</th>
                      <th className="text-right">{t('kulinerOrders.headerTotal') || 'Total Tagihan'}</th>
                      <th>{t('kulinerOrders.headerStatus') || 'Status'}</th>
                      <th>{t('kulinerCommon.paymentMethod') || 'Metode Bayar'}</th>
                      <th className="pr-6 text-right">{t('kulinerOrders.headerAction') || 'Aksi'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-10 text-slate-400">{t('kulinerOrders.emptyOrders') || 'Belum ada pesanan.'}</td></tr>
                    ) : currentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="pl-6">
                          <code className="text-slate-800 font-mono text-[12px] font-normal">
                            {order.order_number || `#ORD-${order.id}`}
                          </code>
                        </td>
                        <td>
                          <span className="text-[12px] text-slate-500 font-normal">
                            {new Date(order.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </td>
                        <td>
                          <div className="font-normal text-[12px] text-slate-900">{order.customer_name}</div>
                        </td>
                        <td>
                          <div className="text-[12px] text-slate-500 font-mono font-normal">{order.customer_phone || '-'}</div>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
                            {order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Bawa Pulang'}
                          </span>
                        </td>
                        <td className="text-right font-semibold text-[12px] text-slate-900">{formatRp(order.total)}</td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal border ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className="text-[12px] text-slate-500 flex items-center gap-1.5 font-normal">
                            {order.payment_method === 'cash_cashier' ? (
                              <><Banknote size={13} className="text-emerald-600" /> {t('kulinerCommon.cashPayment') || 'Tunai Kasir'}</>
                            ) : (
                              <><Smartphone size={13} className="text-blue-600" /> {t('kulinerCommon.qrisPayment') || 'QRIS Kasir'}</>
                            )}
                          </span>
                        </td>
                        <td className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title={t('kulinerOrders.viewBtn') || 'Detail / Proses'}
                              onClick={() => { setSelectedOrder(order); setIsModalOpen(true); setIsPaymentMode(false); setCashReceived(''); }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Struk"
                              onClick={() => setReceiptOrder(order)}
                            >
                              <Receipt size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ClientPagination setItemsPerPage={setItemsPerPage} 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOrders.length}
              />
            </div>

            {/* ORDER DETAIL MODAL */}
            {isModalOpen && selectedOrder && (
              <div className="kd-modal-overlay visible" onClick={() => { setIsModalOpen(false); setIsPaymentMode(false); setCashReceived(''); }}>
                <div className="kd-modal" onClick={e => e.stopPropagation()}>
                  <div className="kd-modal-header">
                    <h2 className="kd-modal-title">Pesanan {selectedOrder.order_number || `#ORD-${selectedOrder.id}`}</h2>
                    <button className="kd-close-btn" onClick={() => { setIsModalOpen(false); setIsPaymentMode(false); setCashReceived(''); }}><X size={18} /></button>
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
                          className="kd-btn kd-btn-primary flex items-center justify-center gap-2"
                          style={{ flex: 1 }}
                          onClick={() => {
                            if (selectedOrder.payment_method === 'cash_cashier') {
                              setIsPaymentMode(true);
                            } else {
                              updateOrderStatus(selectedOrder.id, 'processing');
                            }
                          }}
                        >
                          <Banknote size={16} /> Verifikasi & Terima Pembayaran
                        </button>
                      )}
                      {selectedOrder.status === 'processing' && (
                        <button
                          className="kd-btn kd-btn-primary flex items-center justify-center gap-2"
                          style={{ flex: 1, background: '#10b981' }}
                          onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                        >
                          <CheckCircle2 size={16} /> Tandai Selesai (Sajikan)
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                        <button className="kd-btn kd-btn-secondary flex items-center justify-center gap-1.5" style={{ flex: 1, padding: '8px 4px', fontSize: '13px' }} onClick={handlePrintReceipt}>
                          <Printer size={15} /> Struk
                        </button>
                        <button className="kd-btn kd-btn-secondary flex items-center justify-center gap-1.5" style={{ flex: 1, padding: '8px 4px', fontSize: '13px' }} onClick={handlePrintKitchenReceipt}>
                          <ChefHat size={15} /> Dapur
                        </button>
                      </div>
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
