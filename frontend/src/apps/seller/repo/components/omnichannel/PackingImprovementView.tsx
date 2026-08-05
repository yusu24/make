import React, { useState, useMemo } from 'react';
import { QrCode, Search, Printer, Package, CheckCircle2, AlertCircle, Scan, Check, X, PackageCheck } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface PackingQueueItem {
  id: string;
  orderId: string;
  courier: string;
  items: string;
  printed: boolean;
}

const INITIAL_PACKING_QUEUE: PackingQueueItem[] = [
  { id: '1', orderId: 'INV-12008', courier: 'J&T Express', items: '2x SKU-001, 1x SKU-003', printed: true },
  { id: '2', orderId: 'INV-12009', courier: 'SiCepat Halu', items: '1x SKU-002', printed: false },
  { id: '3', orderId: 'INV-12010', courier: 'GoSend Instant', items: '3x SKU-004', printed: true },
  { id: '4', orderId: 'INV-12011', courier: 'JNE Reguler', items: '1x SKU-005', printed: false },
  { id: '5', orderId: 'INV-12012', courier: 'Ninja Xpress', items: '2x SKU-006', printed: true },
  { id: '6', orderId: 'INV-12013', courier: 'Anteraja Reg', items: '1x SKU-007', printed: false },
];

export const PackingImprovementView: React.FC = () => {
  const [scannedResi, setScannedResi] = useState('');
  const [scanHistory, setScanHistory] = useState<Array<{ resi: string; status: 'valid' | 'invalid'; time: string }>>([
    { resi: 'JP1234567890', status: 'valid', time: '10:42 AM' },
    { resi: '01234567891234', status: 'valid', time: '10:40 AM' },
    { resi: 'INVALID-9921', status: 'invalid', time: '10:35 AM' },
  ]);
  const [queue, setQueue] = useState<PackingQueueItem[]>(INITIAL_PACKING_QUEUE);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedResi.trim()) return;

    const isValid = !scannedResi.toLowerCase().includes('invalid');
    const newEntry = {
      resi: scannedResi,
      status: (isValid ? 'valid' : 'invalid') as 'valid' | 'invalid',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setScanHistory((prev) => [newEntry, ...prev]);
    if (isValid) {
      showToast(`Scan Barcode ${scannedResi} Valid! Pesanan diverifikasi.`);
    } else {
      showToast(`Barcode ${scannedResi} Tidak Ditemukan dalam Sistem!`);
    }
    setScannedResi('');
  };

  const handleBulkPrint = () => {
    showToast('Mencetak 45 Label Resi / Shipping Label sekaligus...');
  };

  const handleMarkPacked = (orderId?: string) => {
    if (orderId) {
      setQueue((prev) => prev.filter((q) => q.orderId !== orderId));
      showToast(`Pesanan ${orderId} berhasil ditandai selesai dikemas.`);
    } else {
      showToast('Semua pesanan tercentang berhasil ditandai dikemas!');
    }
  };

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      return (
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.items.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [queue, searchTerm]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setCurrentPage,
  } = usePagination(filteredQueue);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Packing Improvement</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Optimalkan proses picking dan packing menggunakan scan barcode resi.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={handleBulkPrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Cetak Label Massal</span>
          </button>
        </div>
      </div>

      {/* Barcode Scanner Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden text-white flex flex-col md:flex-row border border-indigo-500/30">
        {/* Left Side: Input Scanner */}
        <div className="p-6 md:w-7/12 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Scan className="w-4 h-4 text-indigo-300" />
              <span>Barcode Scanner / Validasi Resi</span>
            </div>
            <h3 className="text-xl font-bold">Scan Resi Sebelum Packing</h3>
            <p className="text-xs text-indigo-100/90 mt-1 max-w-lg leading-relaxed">
              Arahkan alat barcode scanner fisik (atau ketik nomor resi/AWB) untuk memverifikasi keabsahan pesanan dan memastikan barang yang dibungkus tidak salah kirim.
            </p>
          </div>

          <form onSubmit={handleScan} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Scan atau ketik no. resi (misal: JP1234567890)..."
              value={scannedResi}
              onChange={(e) => setScannedResi(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-indigo-200 text-xs focus:outline-none focus:ring-2 focus:ring-white transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-white text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-50 transition-colors shadow-md cursor-pointer shrink-0"
            >
              Verify
            </button>
          </form>

          <div className="flex items-center gap-6 pt-1 text-xs text-indigo-200">
            <div>
              <span className="block text-[10px] text-indigo-300 font-semibold uppercase">Total Verified Hari Ini</span>
              <span className="text-base font-extrabold text-white">142 Paket</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="block text-[10px] text-indigo-300 font-semibold uppercase">Status Kecepatan QC</span>
              <span className="text-base font-extrabold text-emerald-300">Akurat (99.8%)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Riwayat Scan Terakhir */}
        <div className="p-6 md:w-5/12 bg-black/20 backdrop-blur-xs border-t md:border-t-0 md:border-l border-white/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                Riwayat Scan Terakhir
              </h4>
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-semibold">
                Real-time
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-40 text-xs pr-1">
              {scanHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
                  <span className="font-mono font-bold tracking-wide">{item.resi}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-200">{item.time}</span>
                    {item.status === 'valid' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-400/30">
                        <X className="w-3 h-3 text-rose-400" />
                        Invalid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-indigo-200/80 mt-3 pt-2 border-t border-white/10">
            *Resi yang berhasil di-scan valid akan otomatis mengonfirmasi kelengkapan item pesanan.
          </p>
        </div>
      </div>

      {/* Main Table Area (To Be Packed) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Antrean Packing <span className="text-xs text-slate-500 font-normal">({queue.length} Pesanan)</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <button
              onClick={() => handleMarkPacked()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Tandai Dikemas</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                </th>
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">EKSPEDISI / KURIR</th>
                <th className="py-3 px-4">ITEM PRODUK (SKU)</th>
                <th className="py-3 px-4 text-center">STATUS CETAK RESI</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Semua antrean packing selesai!
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{row.orderId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{row.courier}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">{row.items}</td>
                    <td className="py-3.5 px-4 text-center">
                      {row.printed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                          Sudah Dicetak
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
                          Belum Dicetak
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleMarkPacked(row.orderId)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold cursor-pointer"
                      >
                        Selesai Packing
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Standardized Pagination matching CatalogView */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
