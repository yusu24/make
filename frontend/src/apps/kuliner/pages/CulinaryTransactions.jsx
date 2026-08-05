import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../contexts/I18nContext';
import { Eye } from 'lucide-react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const CulinaryTransactions = () => {
  const { t } = useTranslation();
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
  const [detailItem, setDetailItem] = useState(null);
  const [physicalBalance, setPhysicalBalance] = useState('');
  const [reconDifference, setReconDifference] = useState(null);
  const handleCloseRecon = () => {
    setIsReconModalOpen(false);
    setPhysicalBalance('');
    setReconDifference(null);
  };
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
      alert(t('kulinerTransactions.alertExpenseFail') || 'Gagal mencatat pengeluaran.');
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
        <h1 className="kd-page-title">{t('kulinerTransactions.title') || 'Buku Kas & Transaksi'}</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message={t('kulinerTransactions.loading') || 'Menyiapkan buku kas...'} />
        ) : (
          <>
            <div className="kd-page-actions">
              <button className="kd-btn kd-btn-secondary" onClick={() => setIsExpenseModalOpen(true)}>{t('kulinerTransactions.addExpenseBtn') || '+ Catat Pengeluaran'}</button>
              <button className="kd-btn kd-btn-primary" onClick={() => setIsReconModalOpen(true)}>{t('kulinerTransactions.reconBtn') || '📊 Rekonsiliasi Kas'}</button>
            </div>
            {/* LEDGER CARDS */}
            <div className="kd-ledger-grid" style={{ marginBottom: 32 }}>
              <div className="kd-panel" style={{ background: '#f0fdf4', borderColor: '#22c55e' }}>
                <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2">{t('kulinerTransactions.summaryTotalIncome') || 'Total Kas Masuk'}</div>
                <div className="text-3xl font-black text-green-800">{formatRp(balanceSummary.totalIncome)}</div>
              </div>
              <div className="kd-panel" style={{ background: '#fef2f2', borderColor: '#ef4444' }}>
                <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2">{t('kulinerTransactions.summaryTotalExpense') || 'Total Kas Keluar'}</div>
                <div className="text-3xl font-black text-red-700">{formatRp(balanceSummary.totalExpense)}</div>
              </div>
              <div className="kd-panel" style={{ background: '#f8fafc', borderLeft: '4px solid #1e293b' }}>
                <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2">{t('kulinerTransactions.summaryNetBalance') || 'Saldo Bersih (Profit)'}</div>
                <div className="text-3xl font-black text-slate-800">{formatRp(balanceSummary.netBalance)}</div>
              </div>
            </div>

            <div className="kd-panel">
              <div className="kd-panel-header">
                <div className="text-sm font-bold text-slate-800">{t('kulinerTransactions.journalTitle') || 'Jurnal Transaksi Terbaru'}</div>
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
                    <option value="all">{t('kulinerTransactions.filterAllType') || 'Semua Tipe'}</option>
                    <option value="income">{t('kulinerTransactions.filterIncome') || 'Pemasukan'}</option>
                    <option value="expense">{t('kulinerTransactions.filterExpense') || 'Pengeluaran'}</option>
                  </select>
                  <select 
                    className="kd-form-select" 
                    style={{ padding: '6px 12px', fontSize: 11, width: 'auto', minHeight: 'unset' }}
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">{t('kulinerTransactions.filterAllCategory') || 'Semua Kategori'}</option>
                    <option value="Penjualan">Penjualan</option>
                    <option value="Bahan Baku">Bahan Baku</option>
                    <option value="Operasional">Operasional (Listrik, Air)</option>
                    <option value="Gaji Karyawan">Gaji Karyawan</option>
                    <option value="Marketing">Marketing / Iklan</option>
                    <option value="Lainnya">Lainnya</option>
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
                        <th>{t('kulinerTransactions.tableHeaderDate') || 'Tanggal'}</th>
                        <th>{t('kulinerTransactions.tableHeaderDesc') || 'Keterangan'}</th>
                        <th>Ref ID</th>
                      <th>{t('kulinerTransactions.tableHeaderCategory') || 'Kategori / Tipe'}</th>
                      <th>Tipe</th>
                      <th>{t('kulinerTransactions.tableHeaderAmount') || 'Nominal'}</th>
                      <th className="text-right">{t('kulinerTransactions.tableHeaderAction') || 'Aksi'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-10 text-slate-400">{t('kulinerTransactions.emptyTransactions') || 'Tidak ada transaksi yang cocok dengan filter.'}</td></tr>
                    ) : (
                      currentTransactions.map(item => (
                        <tr key={item.id}>
                            <td className="text-xs text-slate-500">
                              {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </td>
                            <td>
                              <div style={{ color: '#1e293b' }}>{item.description}</div>
                            </td>
                            <td><span className="text-xs text-slate-400">{item.id}</span></td>
                          <td><span className="text-sm bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">{item.category}</span></td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.type === 'income' ? '#10b981' : '#ef4444' }} />
                              <span className={`text-sm font-medium ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'income' ? t('kulinerTransactions.detailIncome') || 'Pemasukan' : t('kulinerTransactions.detailExpense') || 'Pengeluaran'}
                              </span>
                            </div>
                          </td>
                          <td className="text-slate-900 font-medium">
                            {item.type === 'income' ? '+' : '-'}{formatRp(item.amount)}
                          </td>
                          <td className="text-right">
                            <button className="kd-icon-btn" title={t('kulinerTransactions.detailBtn') || 'Detail'} onClick={() => setDetailItem(item)}><Eye size={16} /></button>
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
                    <h2 className="kd-modal-title">{t('kulinerTransactions.expenseModalTitle') || 'Catat Pengeluaran (Expense)'}</h2>
                    <button className="kd-close-btn" onClick={() => setIsExpenseModalOpen(false)}>✕</button>
                  </div>
                  <form onSubmit={handleExpenseSubmit}>
                    <div className="kd-modal-body">
                      <div className="kd-form-group">
                        <label className="kd-form-label">{t('kulinerTransactions.expenseFormDate') || 'Tanggal Pengeluaran'}</label>
                        <input 
                          type="date" 
                          required 
                          className="kd-form-input"
                          value={expenseForm.date}
                          onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                        />
                      </div>
                      <div className="kd-form-group">
                        <label className="kd-form-label">{t('kulinerTransactions.expenseFormCategory') || 'Kategori Pengeluaran'}</label>
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
                        <label className="kd-form-label">{t('kulinerTransactions.expenseFormAmount') || 'Nominal (Rp)'}</label>
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
                        <label className="kd-form-label">{t('kulinerTransactions.expenseFormDesc') || 'Keterangan / Catatan'}</label>
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
                      <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setIsExpenseModalOpen(false)}>{t('kulinerTransactions.cancelBtn') || 'Batal'}</button>
                      <button type="submit" className="kd-btn kd-btn-primary" disabled={isSaving}>
                        {isSaving ? t('kulinerTransactions.savingBtn') || 'Menyimpan...' : t('kulinerTransactions.saveBtn') || 'Simpan Pengeluaran'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* RECONCILIATION MODAL */}
            {isReconModalOpen && (
              <div className="kd-modal-overlay visible" onClick={() => handleCloseRecon()}>
                <div className="kd-modal" onClick={e => e.stopPropagation()}>
                  <div className="kd-modal-header">
                    <h2 className="kd-modal-title">{t('kulinerTransactions.reconModalTitle') || 'Rekonsiliasi Kas / Cash Opname'}</h2>
                    <button className="kd-close-btn" onClick={() => handleCloseRecon()}>✕</button>
                  </div>
                  <div className="kd-modal-body">
                    <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                      <p className="text-sm text-slate-600 mb-2">{t('kulinerTransactions.reconSystemBalance') || 'Saldo Sistem Saat Ini'}:</p>
                      <h3 className="text-3xl font-black text-slate-800">{formatRp(balanceSummary.netBalance)}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      Gunakan fitur ini untuk mencocokkan saldo sistem dengan uang fisik yang ada di kasir atau rekening Anda.
                    </p>
                    <div className="kd-form-group">
                      <label className="kd-form-label">{t('kulinerTransactions.reconPhysicalBalance') || 'Hitung Fisik Uang di Laci/Bank (Rp)'}</label>
                      <input
                        type="number"
                        className="kd-form-input"
                        placeholder="Masukkan jumlah uang riil..."
                        value={physicalBalance}
                        onChange={e => { setPhysicalBalance(e.target.value); setReconDifference(null); }}
                      />
                    </div>
                    {reconDifference !== null && (
                      <div className={`p-4 rounded-xl mt-2 border ${reconDifference === 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <p className="text-sm text-slate-600 mb-1">Selisih:</p>
                        <h3 className={`text-2xl font-black ${reconDifference === 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {reconDifference > 0 ? '+' : ''}{formatRp(reconDifference)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {reconDifference === 0 ? t('kulinerTransactions.reconDiffZero') || 'Uang Pas (Tidak ada selisih)' : reconDifference > 0 ? t('kulinerTransactions.reconDiffPhysicalGtr') || 'Uang Lebih (Selisih Positif)' : t('kulinerTransactions.reconDiffSystemGtr') || 'Uang Kurang (Selisih Negatif)'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="kd-modal-footer">
                    <button className="kd-btn kd-btn-secondary" onClick={() => handleCloseRecon()}>{t('kulinerTransactions.cancelBtn') || 'Batal'}</button>
                    <button
                      className="kd-btn kd-btn-primary"
                      onClick={() => setReconDifference(Number(physicalBalance || 0) - Number(balanceSummary.netBalance || 0))}
                      disabled={physicalBalance === ''}
                    >
                      {t('kulinerTransactions.reconCalculateBtn') || 'Hitung Selisih'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL MODAL */}
            {detailItem && (
              <div className="kd-modal-overlay visible" onClick={() => setDetailItem(null)}>
                <div className="kd-modal" onClick={e => e.stopPropagation()}>
                  <div className="kd-modal-header">
                    <h2 className="kd-modal-title">{t('kulinerTransactions.detailModalTitle') || 'Detail Transaksi'}</h2>
                    <button className="kd-close-btn" onClick={() => setDetailItem(null)}>✕</button>
                  </div>
                  <div className="kd-modal-body">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Referensi</p>
                        <p className="font-bold text-slate-800">{detailItem.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{t('kulinerTransactions.detailDesc') || 'Deskripsi'}</p>
                        <p className="font-bold text-slate-800">{detailItem.description}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">{t('kulinerTransactions.detailCategory') || 'Kategori'}</p>
                          <p className="font-bold text-slate-800">{detailItem.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">{t('kulinerTransactions.detailDate') || 'Tanggal'}</p>
                          <p className="font-bold text-slate-800">{new Date(detailItem.date).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      {detailItem.status && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Status</p>
                          <p className="font-bold text-slate-800">{detailItem.status}</p>
                        </div>
                      )}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">{detailItem.type === 'income' ? t('kulinerTransactions.detailIncome') || 'Pemasukan' : t('kulinerTransactions.detailExpense') || 'Pengeluaran'}</p>
                        <h3 className={`text-2xl font-black ${detailItem.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                          {detailItem.type === 'income' ? '+' : '-'}{formatRp(detailItem.amount)}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="kd-modal-footer">
                    <button className="kd-btn kd-btn-secondary" onClick={() => setDetailItem(null)}>{t('kulinerTransactions.closeBtn') || 'Tutup'}</button>
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
