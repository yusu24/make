import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import './KulinerDashboard.css';

const CulinaryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceSummary, setBalanceSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetching from general transactions API
      const response = await api.get('/kuliner/admin/orders'); // Using orders as transactions for now
      const orders = response.data;
      
      const totalIncome = orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
      const totalExpense = 0; // Initialize with zero for real tracking
      
      setTransactions(orders);
      setBalanceSummary({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + parseInt(n).toLocaleString('id-ID');
  };

  return (
    <KulinerAdminLayout>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 20px' }}></div>
          <p className="text-slate-400">Menyiapkan buku kas...</p>
        </div>
      ) : (
        <>
          <div className="kd-topbar">
            <div>
              <h1 className="kd-page-title">Buku Kas & Transaksi</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola arus kas masuk dan keluar untuk menjaga stabilitas keuangan.</p>
            </div>
            <div className="kd-topbar-actions">
              <button className="kd-btn kd-btn-secondary">+ Catat Pengeluaran</button>
              <button className="kd-btn kd-btn-primary">📊 Rekonsiliasi Kas</button>
            </div>
          </div>

          <div className="kd-content">
            {/* LEDGER CARDS */}
            <div className="kd-ledger-grid" style={{ marginBottom: 32 }}>
              <div className="kd-panel" style={{ background: '#ecfdf5', borderColor: '#10b981' }}>
                <div className="text-[10px] text-green-600 font-bold tracking-wider mb-2">Total Kas Masuk</div>
                <div className="text-2xl font-black text-green-700">{formatRp(balanceSummary.totalIncome)}</div>
              </div>
              <div className="kd-panel" style={{ background: '#fef2f2', borderColor: '#ef4444' }}>
                <div className="text-[10px] text-red-600 font-bold tracking-wider mb-2">Total Kas Keluar</div>
                <div className="text-2xl font-black text-red-700">{formatRp(balanceSummary.totalExpense)}</div>
              </div>
              <div className="kd-panel" style={{ background: '#f8fafc', borderLeft: '4px solid #1e293b' }}>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider mb-2">Saldo Bersih (Profit)</div>
                <div className="text-2xl font-black text-slate-800">{formatRp(balanceSummary.netBalance)}</div>
              </div>
            </div>

            <div className="kd-panel">
              <div className="kd-panel-header">
                <div className="text-sm font-bold text-slate-800">Jurnal Transaksi Terbaru</div>
              </div>

              <div className="kd-table-container">
                <table className="kd-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Keterangan</th>
                      <th>Kategori</th>
                      <th>Tipe</th>
                      <th>Nominal</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada aktivitas transaksi.</td></tr>
                    ) : (
                      transactions.map(item => (
                        <tr key={item.id}>
                          <td className="text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            <div className="text-[10px] text-slate-300">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                          </td>
                          <td>
                            <div className="font-bold text-slate-700">Penjualan Menu: {item.customer_name}</div>
                            <div className="text-[10px] text-slate-400">Ref: #ORD-{item.order_number || item.id}</div>
                          </td>
                          <td>
                            <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">Operasional</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                              <span className="text-xs text-green-600 font-medium">Masuk</span>
                            </div>
                          </td>
                          <td className="font-bold text-green-600">+{formatRp(item.total)}</td>
                          <td className="text-right">
                            <button className="kd-btn kd-btn-secondary" style={{ padding: '4px 8px', fontSize: 10 }}>Detail</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryTransactions;
