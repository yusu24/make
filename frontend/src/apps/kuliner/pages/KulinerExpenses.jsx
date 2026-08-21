import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import usePagination from '../../../hooks/usePagination';
import ClientPagination from '../components/ClientPagination';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import { useAuth } from '../../../contexts/AuthContext';
import './KulinerDashboard.css';

export default function KulinerExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [financeCategories, setFinanceCategories] = useState([]);
  const [modalType, setModalType] = useState('expense');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchExpenses = async (start, end) => {
    try {
      setLoading(true);
      const res = await api.get('/kuliner/admin/expenses', {
        params: { startDate: start, endDate: end }
      });
      setExpenses(res.data);
    } catch (e) {
      console.error(e);
      alert('Gagal mengambil data pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/kuliner/admin/finance-categories');
      setFinanceCategories(res.data.filter(c => c.is_active));
    } catch (e) {
      console.error('Gagal mengambil kategori', e);
    }
  };

  useEffect(() => {
    fetchExpenses(startDate, endDate);
    fetchCategories();
  }, [startDate, endDate]);

  const handleDateFilterChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);

    const t = new Date();
    if (val === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (val === 'today') {
      const td = t.toISOString().split('T')[0];
      setStartDate(td);
      setEndDate(td);
    } else if (val === 'month') {
      const fd = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
      const ld = new Date(t.getFullYear(), t.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(fd);
      setEndDate(ld);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      date: fd.get('date'),
      type: fd.get('type'),
      description: fd.get('description'),
      amount: parseFloat(fd.get('amount')),
      category: fd.get('category') || 'Lainnya'
    };
    
    try {
      if (editingExpense) {
        await api.put(`/kuliner/admin/expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/kuliner/admin/expenses', data);
      }
      fetchExpenses(startDate, endDate);
      setShowModal(false);
      setEditingExpense(null);
    } catch (e) {
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const openEdit = (ex) => {
    setEditingExpense(ex);
    setModalType(ex.type || 'expense');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  }

  const filteredExpenses = expenses.filter(ex => {
    const matchSearch = ((ex.description || '').toLowerCase().includes(search.toLowerCase()) || (ex.category || '').toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || (typeFilter === 'income' ? ex.type === 'income' : (!ex.type || ex.type === 'expense'));
    return matchSearch && matchType;
  });

  const formatRp = (num) => `Rp ${Math.round(Number(num || 0)).toLocaleString('id-ID')}`;

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const totalIncome = filteredExpenses.filter(ex => ex.type === 'income').reduce((sum, ex) => sum + Number(ex.amount || 0), 0);
  const totalExpense = filteredExpenses.filter(ex => (!ex.type || ex.type === 'expense')).reduce((sum, ex) => sum + Number(ex.amount || 0), 0);
  const totalBalance = totalIncome - totalExpense;

  const chartDataRaw = filteredExpenses.reduce((acc, curr) => {
    const d = curr.date.split('T')[0];
    if (!acc[d]) acc[d] = { dateRaw: d, Pemasukan: 0, Pengeluaran: 0 };
    if (curr.type === 'income') {
      acc[d].Pemasukan += Number(curr.amount || 0);
    } else {
      acc[d].Pengeluaran += Number(curr.amount || 0);
    }
    return acc;
  }, {});
  
  const chartData = Object.values(chartDataRaw).sort((a, b) => a.dateRaw.localeCompare(b.dateRaw)).map(item => ({
    ...item,
    name: new Date(item.dateRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }));

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Pengeluaran-Kuliner-${startDate}_${endDate}`,
    pageStyle: "@page { size: A4; margin: 1cm !important; }",
  });

  const renderExpenseRows = (items, { withActions }) => items.map(ex => (
    <tr key={ex.id}>
      <td className="text-xs text-slate-500">
        {new Date(ex.date).toLocaleDateString('id-ID')}
      </td>
      <td>
        <span style={{ 
            background: ex.type === 'income' ? '#dcfce7' : '#fff7ed', 
            color: ex.type === 'income' ? '#166534' : '#ea580c', 
            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, 
            border: `1px solid ${ex.type === 'income' ? '#bbf7d0' : '#ffedd5'}` 
        }}>
            {ex.category}
        </span>
      </td>
      <td style={{ color: '#1e293b', fontWeight: 500 }}>{ex.description}</td>
      <td style={{ color: '#10b981', fontWeight: 600, textAlign: 'right' }}>
        {ex.type === 'income' ? formatRp(ex.amount) : '-'}
      </td>
      <td style={{ color: '#ef4444', fontWeight: 600, paddingRight: withActions ? 0 : 24, textAlign: 'right' }}>
        {(!ex.type || ex.type === 'expense') ? formatRp(ex.amount) : '-'}
      </td>
      {withActions && (
        <td style={{ textAlign: 'right', paddingRight: 24 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="kd-btn kd-btn-secondary" style={{ padding: '6px' }} onClick={() => openEdit(ex)} title="Edit"><Edit3 size={15} /></button>
            <button className="kd-btn" style={{ padding: '6px', background: '#fef2f2', color: '#ef4444', borderColor: '#fee2e2' }} onClick={async () => { if (confirm('Hapus pencatatan kas ini?')) { await api.delete(`/kuliner/admin/expenses/${ex.id}`); fetchExpenses(startDate, endDate); } }} title="Hapus"><Trash2 size={15} /></button>
          </div>
        </td>
      )}
    </tr>
  ));

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
  } = usePagination(filteredExpenses);

  // Remove PREDEFINED_CATEGORIES, we use financeCategories now

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Pencatatan Kas</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memuat pengeluaran operasional..." />
        ) : (
          <>
            <div className="kd-page-actions no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="kd-btn kd-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', height: 36 }}
                  onClick={() => { setEditingExpense(null); setModalType('expense'); setShowModal(true); }}
                >
                  <Plus size={16} style={{ marginRight: 8 }} />
                  Tambah Transaksi Kas
                </button>

                <select 
                  className="kd-input" 
                  style={{ height: 36, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }}
                  value={typeFilter}
                  onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">Semua Jenis Kas</option>
                  <option value="income">Hanya Pemasukan</option>
                  <option value="expense">Hanya Pengeluaran</option>
                </select>

                <div style={{ position: 'relative', width: 220 }}>
                  <input
                    className="kd-input"
                    style={{ width: '100%', height: 36, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }}
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={18} color="#64748b" />
                  <select className="kd-input" style={{ width: 'auto', height: 36, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }} value={dateFilter} onChange={handleDateFilterChange}>
                    <option value="all">Semua</option>
                    <option value="today">Hari Ini</option>
                    <option value="month">Bulan Ini</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {dateFilter === 'custom' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="date" className="kd-input" style={{ height: 36, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span style={{ color: '#64748b' }}>-</span>
                    <input type="date" className="kd-input" style={{ height: 36, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                )}

                <button className="kd-btn kd-btn-secondary" onClick={handlePrint}>
                  <Printer size={16} style={{ marginRight: 6 }} /> Cetak
                </button>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="kd-panel no-print" style={{ marginBottom: 20 }}>
                <div className="kd-panel-header">
                  <div className="text-sm font-bold text-slate-800">Grafik Arus Kas</div>
                </div>
                <div style={{ height: 300, padding: '20px 20px 0 0' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis 
                        tickFormatter={(v) => `Rp ${v / 1000}k`} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => [formatRp(value), undefined]}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div ref={printRef}>
              <div className="kd-panel no-print">
                <div className="kd-panel-header no-print">
                  <div className="text-sm font-bold text-slate-800">
                    Daftar Pencatatan Kas
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Saldo: <span style={{ color: totalBalance >= 0 ? '#10b981' : '#ef4444' }}>{formatRp(totalBalance)}</span> ({filteredExpenses.length} data)
                  </div>
                </div>

                <div className="kd-table-container no-print">
                  <table className="kd-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                        <th style={{ textAlign: 'right' }}>Pemasukan</th>
                        <th style={{ textAlign: 'right' }}>Pengeluaran</th>
                        <th style={{ textAlign: 'right', paddingRight: 24 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada pencatatan kas.</td></tr>
                      ) : (
                        renderExpenseRows(paginatedData, { withActions: true })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="no-print">
                  <ClientPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={pageSize}
                    setItemsPerPage={setPageSize}
                    totalPages={totalPages}
                    totalItems={totalItems}
                  />
                </div>
              </div>

              {/* PRINT ONLY TABLE - TEMPLATE LABA RUGI GITHUB YUSU24 */}
              <div className="print-only w-full">
                {/* Print Wrapper */}
                <div
                  id="financial-report-sheet"
                  className="w-full text-slate-900 font-sans"
                >
                  {/* HEADER LAPORAN */}
                  <div className="text-center mb-4 leading-tight">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 print:text-black">
                      Laporan Pencatatan Kas Operasional
                    </h2>
                    <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 print:text-black">
                      {user?.tenant_name || 'Toko Kuliner'}
                    </h1>
                    <p className="text-xs font-semibold text-slate-800 print:text-black mt-1">
                      Periode: {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Semua Waktu'}
                    </p>
                  </div>

                  {/* TABEL FINANSIAL */}
                  <div className="overflow-x-auto my-6">
                    <table className="w-full text-xs sm:text-sm text-left mb-6" style={{ borderCollapse: 'collapse' }}>
                      <thead className="bg-slate-100 print:bg-gray-200">
                        <tr>
                          <th className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black">Tanggal</th>
                          <th className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black">Kategori</th>
                          <th className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black">Keterangan</th>
                          <th className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black text-right">Pemasukan</th>
                          <th className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black text-right">Pengeluaran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-6 text-slate-500 italic">Belum ada pencatatan kas.</td>
                          </tr>
                        ) : (
                           filteredExpenses.map(ex => (
                              <tr key={`print-${ex.id}`} className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                                <td className="py-1 px-2 text-slate-800 print:text-black border-b border-slate-100 print:border-transparent">
                                  {new Date(ex.date).toLocaleDateString('id-ID')}
                                </td>
                                <td className="py-1 px-2 text-slate-800 print:text-black border-b border-slate-100 print:border-transparent">
                                  {ex.category}
                                </td>
                                <td className="py-1 px-2 text-slate-800 print:text-black border-b border-slate-100 print:border-transparent">
                                  {ex.description || '-'}
                                </td>
                            <td className="py-2 px-3 border border-slate-300 font-bold text-emerald-600 print:text-black text-right">
                              {ex.type === 'income' ? formatRp(ex.amount) : '-'}
                            </td>
                            <td className="py-2 px-3 border border-slate-300 font-bold text-rose-600 print:text-black text-right">
                              {(!ex.type || ex.type === 'expense') ? formatRp(ex.amount) : '-'}
                            </td>
                          </tr>
                           ))
                        )}
                        <tr>
                          <td colSpan="3" className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black text-right bg-slate-50 print:bg-gray-100">
                            TOTAL PEMASUKAN
                          </td>
                          <td colSpan="2" className="py-2 px-3 border border-slate-300 font-bold text-emerald-600 print:text-black text-right bg-slate-50 print:bg-gray-100">
                            {formatRp(totalIncome)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="py-2 px-3 border border-slate-300 font-bold text-slate-800 print:text-black text-right bg-slate-50 print:bg-gray-100">
                            TOTAL PENGELUARAN
                          </td>
                          <td colSpan="2" className="py-2 px-3 border border-slate-300 font-bold text-rose-600 print:text-black text-right bg-slate-50 print:bg-gray-100">
                            {formatRp(totalExpense)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="py-2 px-3 border border-slate-300 font-bold text-slate-900 print:text-black text-right bg-slate-200 print:bg-gray-300 text-base">
                            SALDO AKHIR
                          </td>
                          <td colSpan="2" className={`py-2 px-3 border border-slate-300 font-bold print:text-black text-right bg-slate-200 print:bg-gray-300 text-base ${totalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatRp(totalBalance)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* FOOTER INFORMASI STANDAR */}
                  <div className="mt-8 text-center text-[10px] text-slate-400 print:text-black italic border-t border-slate-100 print:border-slate-300 pt-2">
                    Dokumen ini dicetak secara otomatis melalui Sistem Manajemen UMKM.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showModal && (
          <div className="kd-modal-overlay visible" onClick={handleClose}>
            <div className="kd-modal max-w-md" onClick={e => e.stopPropagation()}>
              <div className="kd-modal-header">
                <h2 className="kd-modal-title">{editingExpense ? 'Edit Pencatatan Kas' : 'Catat Kas Baru'}</h2>
                <button className="kd-close-btn" onClick={handleClose}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="kd-modal-body">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom: 16 }}>
                    <div className="kd-form-group">
                      <label className="kd-form-label">Tanggal</label>
                      <input name="date" type="date" className="kd-form-input" defaultValue={editingExpense ? editingExpense.date : new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="kd-form-group">
                      <label className="kd-form-label">Jenis Kas</label>
                      <select name="type" className="kd-form-select" value={modalType} onChange={e => setModalType(e.target.value)} required>
                        <option value="expense">Kas Keluar (Pengeluaran)</option>
                        <option value="income">Kas Masuk (Pemasukan)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Kategori</label>
                    <select name="category" className="kd-form-select" defaultValue={editingExpense?.category || ''} required>
                      <option value="">-- Pilih Kategori --</option>
                      {financeCategories.filter(c => c.type === modalType).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Keterangan</label>
                    <input name="description" className="kd-form-input" placeholder={modalType === 'expense' ? "Tulis rincian pengeluaran..." : "Tulis rincian pemasukan..."} defaultValue={editingExpense?.description} required />
                  </div>

                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Nominal (Rp)</label>
                    <CurrencyInput name="amount" className="kd-form-input" placeholder="Contoh: 50000" defaultValue={editingExpense?.amount} required />
                  </div>
                </div>
                
                <div className="kd-modal-footer">
                  <button type="button" className="kd-btn kd-btn-secondary" onClick={handleClose}>Batal</button>
                  <button type="submit" className="kd-btn kd-btn-primary">{editingExpense ? 'Simpan Perubahan' : 'Catat Kas'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </KulinerAdminLayout>
  );
}
