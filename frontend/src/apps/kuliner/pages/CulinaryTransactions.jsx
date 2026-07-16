import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const CulinaryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [balanceSummary, setBalanceSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  });

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Bahan Baku', description: '', amount: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kuliner/admin/ledger'); 
      const ledger = response.data;
      
      const totalIncome = ledger.filter(o => o.type === 'income').reduce((acc, o) => acc + parseFloat(o.amount || 0), 0);
      const totalExpense = ledger.filter(o => o.type === 'expense').reduce((acc, o) => acc + parseFloat(o.amount || 0), 0);
      
      setTransactions(ledger);
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

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/kuliner/admin/expenses', expenseForm);
      setIsExpenseModalOpen(false);
      setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'Bahan Baku', description: '', amount: '' });
      fetchTransactions();
    } catch (error) {
      alert('Gagal mencatat pengeluaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + parseInt(n).toLocaleString('id-ID');
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(item => {
    const isIncome = item.type === 'income'; 
    const matchType = filterType === 'all' || (filterType === 'income' && isIncome) || (filterType === 'expense' && !isIncome);
    
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    const matchDate = filterDate === '' || itemDate === filterDate;
    
    const matchCategory = filterCategory === 'all' || filterCategory === item.category;
    
    return matchType && matchDate && matchCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Buku Kas & Transaksi</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Menyiapkan buku kas..." />
        ) : (
          <>
            <div className="kd-page-actions">
              <button className="kd-btn kd-btn-secondary" onClick={() => setIsExpenseModalOpen(true)}>+ Catat Pengeluaran</button>
              <button className="kd-btn kd-btn-primary" onClick={() => setIsReconModalOpen(true)}>📊 Rekonsiliasi Kas</button>
            </div>
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input 
                    type="date" 
                    className="kd-form-input" 
                    style={{ padding: '6px 12px', fontSize: 11, width: 'auto', minHeight: 'unset' }}
                    value={filterDate}
                    onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                  />
                  <select 
                    className="kd-form-select" 
                    style={{ padding: '6px 12px', fontSize: 11, width: 'auto', minHeight: 'unset' }}
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                  <select 
                    className="kd-form-select" 
                    style={{ padding: '6px 12px', fontSize: 11, width: 'auto', minHeight: 'unset' }}
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Pajak">Pajak</option>
                  </select>
                  {(filterDate || filterType !== 'all' || filterCategory !== 'all') && (
                    <button 
                      className="kd-btn kd-btn-secondary" 
                      style={{ padding: '6px 8px', fontSize: 11 }}
                      onClick={() => { setFilterDate(''); setFilterType('all'); setFilterCategory('all'); setCurrentPage(1); }}
                      title="Reset Filter"
                    >
                      ✕
                    </button>
                  )}
                </div>
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
                    {filteredTransactions.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-slate-400">Tidak ada transaksi yang cocok dengan filter.</td></tr>
                    ) : (
                      currentTransactions.map(item => (
                        <tr key={item.id}>
                          <td className="text-xs text-slate-500">
                            {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            <div className="text-[10px] text-slate-300">{new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                          </td>
                          <td>
                            <div className="font-bold text-slate-700">{item.description}</div>
                            <div className="text-[10px] text-slate-400">Ref: {item.id}</div>
                          </td>
                          <td><span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{item.category}</span></td>
                          <td>
                            <div className="flex items-center gap-1">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.type === 'income' ? '#10b981' : '#ef4444' }} />
                              <span className={`text-xs font-medium ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'income' ? 'Masuk' : 'Keluar'}
                              </span>
                            </div>
                          </td>
                          <td className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatRp(item.amount)}
                          </td>
                          <td className="text-right">
                            <button className="kd-icon-btn" title="Detail"><Eye size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* PAGINATION */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                  <span className="text-xs text-slate-500">
                    Menampilkan <span className="font-bold text-slate-700">{filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> hingga <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-bold text-slate-700">{filteredTransactions.length}</span> transaksi
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="kd-btn kd-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: 11 }}
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      &laquo; Sebelumnya
                    </button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button 
                          key={idx}
                          className={`kd-btn ${currentPage === idx + 1 ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                          style={{ padding: '6px 12px', fontSize: 11, minWidth: 32 }}
                          onClick={() => handlePageChange(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      className="kd-btn kd-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: 11 }}
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Selanjutnya &raquo;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EXPENSE MODAL */}
            {isExpenseModalOpen && (
              <div className="kd-modal-overlay visible" onClick={() => setIsExpenseModalOpen(false)}>
                <div className="kd-modal" onClick={e => e.stopPropagation()}>
                  <div className="kd-modal-header">
                    <h2 className="kd-modal-title">Catat Pengeluaran</h2>
                    <button className="kd-close-btn" onClick={() => setIsExpenseModalOpen(false)}>✕</button>
                  </div>
                  <form onSubmit={handleExpenseSubmit}>
                    <div className="kd-modal-body">
                      <div className="kd-form-group">
                        <label className="kd-form-label">Tanggal Pengeluaran</label>
                        <input 
                          type="date" 
                          required 
                          className="kd-form-input"
                          value={expenseForm.date}
                          onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                        />
                      </div>
                      <div className="kd-form-group">
                        <label className="kd-form-label">Kategori</label>
                        <select 
                          required 
                          className="kd-form-select"
                          value={expenseForm.category}
                          onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                        >
                          <option value="Bahan Baku">Bahan Baku</option>
                          <option value="Operasional">Operasional (Listrik, Air)</option>
                          <option value="Gaji Karyawan">Gaji Karyawan</option>
                          <option value="Marketing">Marketing / Iklan</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div className="kd-form-group">
                        <label className="kd-form-label">Nominal (Rp)</label>
                        <input 
                          type="number" 
                          required 
                          min="0"
                          className="kd-form-input"
                          placeholder="Contoh: 150000"
                          value={expenseForm.amount}
                          onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                        />
                      </div>
                      <div className="kd-form-group">
                        <label className="kd-form-label">Keterangan / Catatan</label>
                        <textarea 
                          className="kd-form-textarea"
                          rows="3"
                          placeholder="Beli gas, beras, ayam..."
                          value={expenseForm.description}
                          onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="kd-modal-footer">
                      <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setIsExpenseModalOpen(false)}>Batal</button>
                      <button type="submit" className="kd-btn kd-btn-primary" disabled={isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* RECONCILIATION MODAL */}
            {isReconModalOpen && (
              <div className="kd-modal-overlay visible" onClick={() => setIsReconModalOpen(false)}>
                <div className="kd-modal" onClick={e => e.stopPropagation()}>
                  <div className="kd-modal-header">
                    <h2 className="kd-modal-title">Rekonsiliasi Kas</h2>
                    <button className="kd-close-btn" onClick={() => setIsReconModalOpen(false)}>✕</button>
                  </div>
                  <div className="kd-modal-body">
                    <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                      <p className="text-sm text-slate-600 mb-2">Saldo Bersih Sistem Saat Ini:</p>
                      <h3 className="text-3xl font-black text-slate-800">{formatRp(balanceSummary.netBalance)}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      Gunakan fitur ini untuk mencocokkan saldo sistem dengan uang fisik yang ada di kasir atau rekening Anda.
                    </p>
                    <div className="kd-form-group">
                      <label className="kd-form-label">Saldo Aktual Fisik / Rekening</label>
                      <input type="number" className="kd-form-input" placeholder="Masukkan jumlah uang riil..." />
                    </div>
                  </div>
                  <div className="kd-modal-footer">
                    <button className="kd-btn kd-btn-secondary" onClick={() => setIsReconModalOpen(false)}>Tutup</button>
                    <button className="kd-btn kd-btn-primary">Hitung Selisih</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </KulinerAdminLayout>
  );
};

export default CulinaryTransactions;