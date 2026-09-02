import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { Plus, Trash2, ArrowRightLeft, Printer } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Skeleton from '../../../components/Skeleton';
import Modal from '../../../components/Modal';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function CashTransfers() {
  const { user } = useAuth();
  const toast = useToast();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef(null);
  
  const [formData, setFormData] = useState({
    transfer_date: new Date().toISOString().split('T')[0],
    from_method: 'Tunai',
    to_method: 'Transfer Bank',
    amount: '',
    note: ''
  });

  // Feature Gating
  const demoEmails = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','seller@demo.com'];
  const isDemo = user?.email?.startsWith('demo-sandbox-') || user?.email?.startsWith('demo-kuliner-') || demoEmails.includes(user?.email);
  const isPro = user?.subscription_plan === 'pro' || isDemo;

  useEffect(() => {
    if (isPro) fetchTransfers();
    else setLoading(false);
  }, [isPro]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/retail/finance/transfers');
      setTransfers(res.data || []);
    } catch (err) {
      toast.error('Gagal memuat mutasi kas');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Mutasi-Kas-${user?.tenant_name || 'Retail'}-${new Date().toISOString().split('T')[0]}`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/retail/finance/transfers', formData);
      toast.success('Mutasi kas berhasil disimpan');
      setIsModalOpen(false);
      setFormData({
        transfer_date: new Date().toISOString().split('T')[0],
        from_method: 'Tunai',
        to_method: 'Transfer Bank',
        amount: '',
        note: ''
      });
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan mutasi kas');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus mutasi kas ini?')) return;
    try {
      await api.delete(`/retail/finance/transfers/${id}`);
      toast.success('Mutasi kas dihapus');
      fetchTransfers();
    } catch (err) {
      toast.error('Gagal menghapus mutasi kas');
    }
  };

  const totalAmount = transfers.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  if (!isPro) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center mt-20">
        <ArrowRightLeft size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Fitur Mutasi Kas (Pro)</h2>
        <p className="text-gray-500 mb-6">Upgrade paket Anda ke Pro untuk membuka fitur Mutasi Kas antar metode pembayaran atau rekening bank.</p>
        <button onClick={() => window.location.href='/retail/subscription'} className="btn btn-primary">
          Upgrade Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="flex justify-end items-center gap-3 mb-6 no-print">
        <button className="btn btn-secondary flex items-center gap-2" onClick={handlePrint} disabled={loading || transfers.length === 0}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Tambah Mutasi
        </button>
      </div>

      <div ref={printRef}>
        {/* ========================================================= */}
        {/* PRINT-ONLY FORMAL ACCOUNTING CASH TRANSFERS TEMPLATE      */}
        {/* ========================================================= */}
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#0f172a' }}>
          
          {/* 1. Header / Kop Laporan Resmi */}
          <RetailPrintHeader
            user={user}
            title="Laporan Mutasi Kas & Bank"
            subtitle="Riwayat Pemindahan & Rekonsiliasi Kas Antar Rekening / Akun Pembayaran (Transfer Statement)"
            periodText="Semua Riwayat Tercatat"
          />

          {/* 2. Formal Cash Transfer Statement Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader title="I. Laporan Rekapitulasi Mutasi Kas (Cash Transfers Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. TOTAL AKTIVITAS MUTASI DANA
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Frekuensi Pemindahan Kas Antar Akun / Rekening
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>
                    {transfers.length} Transaksi
                  </td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Total Nilai Kas yang Dimutasi
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600 }}>
                    {formatRp(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader 
              title="II. Rincian Riwayat Pemindahan Kas Antar Rekening (Transfer Records)" 
              rightText={`Total ${transfers.length} riwayat mutasi`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 110, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>Dari Akun (Sumber)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>Ke Akun (Tujuan)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 140, fontWeight: 600, whiteSpace: 'nowrap' }}>Nominal Mutasi (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan / Memo</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                      Belum ada riwayat mutasi kas.
                    </td>
                  </tr>
                ) : (
                  transfers.map((t, idx) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{t.transfer_date ? formatDateIndo(t.transfer_date) : '-'}</td>
                      <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{t.from_method}</td>
                      <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{t.to_method}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                        {formatRp(t.amount)}
                      </td>
                      <td style={{ padding: '6px 6px', color: '#374151', fontSize: 9.5 }}>{t.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Akumulasi Mutasi:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <RetailPrintFooter user={user} showSignatures={true} />

          {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & PROSEDUR REKONSILIASI BANK (TANPA ROMAWI) */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <RetailPrintAppendixHeader 
              title="Lampiran: Penjelasan & Tata Kelola Mutasi Kas & Rekening Bank"
              subtitle={`Keterangan Prosedur Rekonsiliasi Rekening & Pemindahan Likuiditas — ${user?.tenant_name || 'Toko Retail'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <RetailPrintExplanationBox
                number="1"
                title="Definisi & Karakteristik Mutasi Kas Antar Akun"
                desc="Mutasi kas adalah transaksi pemindahan nilai uang dari satu pos/metode penyimpanan ke pos lainnya (contoh: setor uang tunai kasir ke rekening bank operasional atau pengisian kas kecil/petty cash)."
                formula="Sifat Transaksi: Netral terhadap Laba Rugi (Hanya mengubah komposisi likuiditas aset lancar)"
                variant="default"
              />

              <RetailPrintExplanationBox
                number="2"
                title="Validasi Akun Sumber & Akun Tujuan"
                desc="Setiap pemindahan dana harus mencantumkan akun sumber yang mendebit kas serta akun tujuan yang mengkredit kas secara seimbang untuk menjaga neraca saldo kas tetap sinkron."
                variant="indigo"
              />

              <RetailPrintExplanationBox
                number="3"
                title="Prosedur Setor Tunai Harian & Pengamanan Kas Toko"
                desc="Toko ritel dianjurkan memindahkan akumulasi uang tunai kasir harian ke rekening bank resmi secara berkala untuk meminimalisir risiko kehilangan uang tunai di lokasi toko."
                variant="emerald"
              />

              <RetailPrintExplanationBox
                number="4"
                title="Rekonsiliasi Bank & Audit Bukti Transfer"
                desc="Seluruh riwayat mutasi harus dicocokkan dengan mutasi rekening koran bank bulanan. Bukti transfer atau slip setoran wajib disimpan sebagai lampiran pertanggungjawaban keuangan."
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden no-print">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Dari Akun</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Ke Akun</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Nominal</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Keterangan</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="p-4"><Skeleton width={80} /></td>
                    <td className="p-4"><Skeleton width={120} /></td>
                    <td className="p-4"><Skeleton width={120} /></td>
                    <td className="p-4"><Skeleton width={100} /></td>
                    <td className="p-4"><Skeleton width={150} /></td>
                    <td className="p-4 text-right"><Skeleton width={40} /></td>
                  </tr>
                ))
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Belum ada mutasi kas.
                  </td>
                </tr>
              ) : (
                transfers.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-medium text-slate-700">{formatDateIndo(t.transfer_date)}</td>
                    <td className="p-4 text-sm font-medium text-red-600">{t.from_method}</td>
                    <td className="p-4 text-sm font-medium text-green-600">{t.to_method}</td>
                    <td className="p-4 text-sm font-medium">{formatRp(t.amount)}</td>
                    <td className="p-4 text-sm text-gray-500">{t.note || '-'}</td>
                    <td className="p-4 text-sm text-right">
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Hapus Mutasi">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Mutasi Kas">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" required value={formData.transfer_date} onChange={e => setFormData({...formData, transfer_date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Akun (Sumber)</label>
              <select value={formData.from_method} onChange={e => setFormData({...formData, from_method: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Tunai">Tunai</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Kartu Debit">Kartu Debit</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="QRIS">QRIS</option>
                <option value="E-Wallet">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ke Akun (Tujuan)</label>
              <select value={formData.to_method} onChange={e => setFormData({...formData, to_method: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tunai">Tunai</option>
                <option value="Kartu Debit">Kartu Debit</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="QRIS">QRIS</option>
                <option value="E-Wallet">E-Wallet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
            <input type="number" required min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
            <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" rows="2" placeholder="Cth: Setor tunai hasil shift pagi ke BCA"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Mutasi</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
