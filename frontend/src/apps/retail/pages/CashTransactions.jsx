import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function CashTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); // all, today, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [modalType, setModalType] = useState('expense'); // 'income' or 'expense'

  const fetchCategories = async () => {
    try {
      const resIn = await api.get('/retail/finance-categories?type=income');
      const resEx = await api.get('/retail/finance-categories?type=expense');
      setCategories([...resIn.data, ...resEx.data]);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchTransactions = async (start, end) => {
    setLoading(true);
    try {
      const params = (start && end) ? `?startDate=${start}&endDate=${end}` : '';
      const [resIncomes, resExpenses] = await Promise.all([
        api.get(`/retail/finance/incomes${params}`),
        api.get(`/retail/finance/expenses${params}`)
      ]);
      
      const incomes = (resIncomes.data || []).map(i => ({ ...i, tx_type: 'income' }));
      const expenses = (resExpenses.data || []).map(e => ({ ...e, tx_type: 'expense' }));
      
      const combined = [...incomes, ...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setTransactions(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchTransactions(startDate, endDate); }, [startDate, endDate]);

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
      tanggal: fd.get('tanggal'),
      keterangan: fd.get('keterangan'),
      nominal: parseFloat(fd.get('nominal')),
      finance_category_id: fd.get('finance_category_id') || null
    };
    
    try {
      if (editingData) {
        const endpoint = editingData.tx_type === 'income' ? '/retail/finance/incomes' : '/retail/finance/expenses';
        await api.put(`${endpoint}/${editingData.id}`, data);
      } else {
        const endpoint = modalType === 'income' ? '/retail/finance/incomes' : '/retail/finance/expenses';
        await api.post(endpoint, data);
      }
      fetchTransactions(startDate, endDate);
      setShowModal(false);
      setEditingData(null);
    } catch (e) {
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const openEdit = (tx) => {
    setEditingData(tx);
    setModalType(tx.tx_type);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingData(null);
    setModalType('expense'); // default
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingData(null);
  };

  const filteredTransactions = transactions.filter(tx =>
    (tx.keterangan || '').toLowerCase().includes(search.toLowerCase()) ||
    (tx.kategori || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalIncomes = filteredTransactions.filter(tx => tx.tx_type === 'income').reduce((sum, tx) => sum + Number(tx.nominal || 0), 0);
  const totalExpenses = filteredTransactions.filter(tx => tx.tx_type === 'expense').reduce((sum, tx) => sum + Number(tx.nominal || 0), 0);
  const netCashFlow = totalIncomes - totalExpenses;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Catatan-Kas-${user?.tenant_name || 'Retail'}-${startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]}`,
  });

  const renderTransactionRows = (items, { withActions }) => items.map(tx => (
    <tr key={`${tx.tx_type}_${tx.id}`}>
      <td className="pl-6">
        <span className="retail-text-primary font-medium">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</span>
      </td>
      <td>
        <span className="retail-badge retail-badge-primary">{tx.kategori}</span>
      </td>
      <td className="retail-text-primary">{tx.keterangan}</td>
      <td className="text-right retail-text-success font-semibold">
        {tx.tx_type === 'income' ? formatRp(tx.nominal) : '-'}
      </td>
      <td className="text-right retail-text-danger font-semibold">
        {tx.tx_type === 'expense' ? formatRp(tx.nominal) : '-'}
      </td>
      {withActions && (
        <td style={{ textAlign: 'right' }} className="pr-6">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button title="Edit catatan" className="btn btn-sm btn-ghost" onClick={() => openEdit(tx)}><Edit3 size={15} /></button>
            <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { 
                if (confirm('Hapus pencatatan kas ini?')) { 
                    const endpoint = tx.tx_type === 'income' ? '/retail/finance/incomes' : '/retail/finance/expenses';
                    await api.delete(`${endpoint}/${tx.id}`); 
                    fetchTransactions(startDate, endDate); 
                } 
            }} title="Hapus"><Trash2 size={15} /></button>
          </div>
        </td>
      )}
    </tr>
  ));

  const {
    currentPage, setCurrentPage, pageSize, setPageSize, totalPages, totalItems, paginatedData, startIndex, endIndex
  } = usePagination(filteredTransactions);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">

      <div className="page-header" style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint} disabled={loading}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* ========================================================= */}
        {/* PRINT-ONLY FORMAL ACCOUNTING CASH TRANSACTIONS TEMPLATE   */}
        {/* ========================================================= */}
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#0f172a' }}>
          
          {/* 1. Header / Kop Laporan Resmi */}
          <RetailPrintHeader
            user={user}
            title="Laporan Catatan Kas"
            subtitle="Pencatatan Arus Kas Operasional, Beban & Pemasukan Manual (General Cash Ledger)"
            startDate={startDate}
            endDate={endDate}
          />

          {/* 2. Formal Cash Summary Statement Breakdown Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader title="I. Laporan Posisi Saldo Kas (Cash Ledger Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                {/* A. PEMASUKAN */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. TOTAL PENERIMAAN KAS (CASH INFLOW)
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Pemasukan Kas Tambahan & Non-Kasir Tercatat
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>
                    +{formatRp(totalIncomes)}
                  </td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Total Penerimaan Kas Masuk (A)
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600, fontSize: 11 }}>
                    +{formatRp(totalIncomes)}
                  </td>
                </tr>

                {/* B. PENGELUARAN */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                    B. TOTAL PENGELUARAN KAS & BEBAN OPERASIONAL (CASH OUTFLOW)
                  </td>
                  <td style={{ padding: '8px 4px 6px', textAlign: 'right' }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Beban Operasional Toko, Logistik, Gaji & Pemeliharaan
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>
                    ({formatRp(totalExpenses)})
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Total Pengeluaran Kas Tercatat (B)
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600 }}>
                    ({formatRp(totalExpenses)})
                  </td>
                </tr>

                {/* C. SALDO BERSIH */}
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    C. SALDO KAS BERSIH PERIODE BERJALAN (NET CASH MOVEMENT = A - B)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    {filteredTransactions.length} Transaksi Tercatat
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600 }}>
                    {formatRp(netCashFlow)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader 
              title="II. Buku Kas Umum Rincian Transaksi (General Cash Ledger)" 
              rightText={`Total ${filteredTransactions.length} baris transaksi`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 100, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>Kategori Akun</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan / Deskripsi</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 125, fontWeight: 600, whiteSpace: 'nowrap' }}>Pemasukan (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 125, fontWeight: 600, whiteSpace: 'nowrap' }}>Pengeluaran (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                      Tidak ada catatan kas pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => (
                    <tr key={`${tx.tx_type}_${tx.id}`} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{formatDateIndo(tx.tanggal)}</td>
                      <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{tx.kategori || '-'}</td>
                      <td style={{ padding: '6px 6px', color: '#374151', fontSize: 9.5 }}>{tx.keterangan || '-'}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', fontWeight: tx.tx_type === 'income' ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {tx.tx_type === 'income' ? formatRp(tx.nominal) : '-'}
                      </td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', fontWeight: tx.tx_type === 'expense' ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {tx.tx_type === 'expense' ? formatRp(tx.nominal) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Kas:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalIncomes)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalExpenses)})
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <RetailPrintFooter user={user} showSignatures={true} />

          {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & METODOLOGI PEMBUKUAN KAS (TANPA ROMAWI) */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <RetailPrintAppendixHeader 
              title="Lampiran: Penjelasan & Tata Kelola Pembukuan Kas Toko"
              subtitle={`Keterangan Kebijakan Akuntansi Kas Operasional & Prosedur Validasi — ${user?.tenant_name || 'Toko Retail'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <RetailPrintExplanationBox
                number="1"
                title="Pencatatan Pemasukan Kas Manual (Non-POS Revenue)"
                desc="Mencatat seluruh penerimaan kas di luar transaksi penjualan mesin kasir harian, seperti pendapatan sewa display toko, pengembalian deposit, jasa titip, atau modal tambahan pemilik."
                formula="Rumus: Total Pemasukan = Σ (Seluruh Transaksi Pemasukan Kas Masuk Tercatat)"
                variant="emerald"
              />

              <RetailPrintExplanationBox
                number="2"
                title="Pencatatan Beban Operasional & Pengeluaran Toko (Operating Expenses)"
                desc="Akumulasi seluruh pengeluaran kas non-HPP untuk biaya operasional toko harian, meliputi gaji staf, tagihan listrik, air, internet, alat tulis kasir, kebersihan, dan logistik."
                formula="Rumus: Total Pengeluaran = Σ (Seluruh Transaksi Pengeluaran Kas Tercatat)"
                variant="rose"
              />

              <RetailPrintExplanationBox
                number="3"
                title="Posisi Saldo Kas Bersih (Net Cash Balance)"
                desc="Merupakan selisih murni antara total kas yang masuk dengan total kas yang keluar selama periode tanggal yang dipilih."
                formula="Rumus: Saldo Bersih = Total Pemasukan Kas - Total Pengeluaran Kas"
                variant="indigo"
              />

              <RetailPrintExplanationBox
                number="4"
                title="Kategorisasi Akun & Standar Akuntansi Biaya"
                desc="Setiap pengeluaran kas dikelompokkan ke dalam kategori biaya yang telah ditetapkan guna mempermudah analisis efisiensi pengeluaran toko pada laporan laba rugi bulanan."
                variant="default"
              />

              <RetailPrintExplanationBox
                number="5"
                title="Prinsip Validasi & Kepatuhan Bukti Transaksi Fisik"
                desc="Setiap mutasi kas masuk maupun kas keluar wajib diverifikasi dengan bukti fisik kwitansi, struk belanja, atau nota resmi untuk menjamin akuntabilitas pembukuan."
                variant="dark"
              />
            </div>

            {/* Catatan Audit Sistem (Tanpa Kolom Tanda Tangan Ulang) */}
            <RetailPrintFooter user={user} showSignatures={false} />
          </div>

        </div>

        {/* ========================================================= */}
        {/* SCREEN-ONLY INTERACTIVE UI                                 */}
        {/* ========================================================= */}
        <div className="card table-wrap animate-fade-in mt-4 no-print">
          <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
            <button
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
              onClick={openCreate}
            >
              <Plus size={15} className="mr-2 mobile-no-margin" />
              <span className="btn-text-mobile-hide">Tambah Catatan</span>
            </button>
            <div className="airy-search-wrapper" style={{ width: 220, margin: 0 }}>
              <input
                placeholder="Cari transaksi kas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="retail-filter-group">
              <Calendar size={15} className="retail-text-secondary" style={{ flexShrink: 0 }} />
              <select className="retail-filter-select" value={dateFilter} onChange={handleDateFilterChange}>
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Pilih Rentang Tanggal...</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="date" className="retail-filter-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input type="date" className="retail-filter-date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            )}
          </div>

          <div className="retail-table-responsive"><table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Tanggal</th>
                <th className="retail-table-header">Kategori</th>
                <th className="retail-table-header">Keterangan</th>
                <th className="retail-table-header text-right">Pemasukan</th>
                <th className="retail-table-header text-right">Pengeluaran</th>
                <th className="text-right pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <RetailTableLoadingRow colSpan={6} text="Menyinkronkan data kas..." />
              ) : filteredTransactions.length === 0 ? (
                 <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada catatan kas (Pemasukan / Pengeluaran manual).</td></tr>
              ) : renderTransactionRows(paginatedData, { withActions: true })}
            </tbody>
          </table></div>
          <div>
            <RetailPagination
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
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={handleClose}
        title={editingData ? 'Edit Catatan Kas' : 'Catat Transaksi Kas Baru'}
      >
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          
          {!editingData && (
              <div className="form-group">
                 <label className="form-label">Tipe Transaksi</label>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                       <input type="radio" name="tx_type" value="income" checked={modalType === 'income'} onChange={() => setModalType('income')} />
                       <span style={{ fontWeight: 500 }}>Pemasukan</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                       <input type="radio" name="tx_type" value="expense" checked={modalType === 'expense'} onChange={() => setModalType('expense')} />
                       <span style={{ fontWeight: 500 }}>Pengeluaran</span>
                    </label>
                 </div>
              </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input name="tanggal" type="date" className="form-input" defaultValue={editingData ? editingData.tanggal : new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select name="finance_category_id" className="form-input" defaultValue={editingData?.finance_category_id || ''} required>
                <option value="" disabled>Pilih Kategori...</option>
                {categories.filter(c => c.type === modalType).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {categories.filter(c => c.type === modalType).length === 0 && (
                <small style={{ color: 'var(--danger-500)', marginTop: 4 }}>
                  Kategori {modalType === 'income' ? 'pemasukan' : 'pengeluaran'} kosong. Tambahkan di menu Data Master.
                </small>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input name="keterangan" className="form-input" placeholder="Tulis rincian catatan..." defaultValue={editingData?.keterangan} required />
          </div>

          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <CurrencyInput name="nominal" className="form-input" placeholder="Contoh: 50000" defaultValue={editingData?.nominal} required />
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingData ? 'Simpan Perubahan' : 'Catat Transaksi'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
