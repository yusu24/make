import React, { useState, useMemo } from 'react';
import { History, Search, Filter, CheckCircle2, AlertCircle, RefreshCw, FileText, X } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { useAuth } from '../../../../../contexts/AuthContext';

interface SyncLogItem {
  id: string;
  time: string;
  type: 'Products' | 'Stock' | 'Price' | 'Orders';
  platform: 'Shopee' | 'Tokopedia' | 'TikTok Shop' | 'Lazada';
  shop: string;
  status: 'Success' | 'Partial' | 'Failed';
  success: number;
  failed: number;
  duration: string;
  logMessage?: string;
}

const INITIAL_SYNC_LOGS: SyncLogItem[] = [
  { id: 'LOG-8801', time: '10:45 AM, 12 Oct', type: 'Products', platform: 'Shopee', shop: 'GlowUp Official Store', status: 'Success', success: 34, failed: 0, duration: '4s', logMessage: 'Semua SKU berhasil disinkronkan tanpa error.' },
  { id: 'LOG-8802', time: '10:42 AM, 12 Oct', type: 'Orders', platform: 'Tokopedia', shop: 'TechZone ID Tokopedia', status: 'Success', success: 5, failed: 0, duration: '2s', logMessage: '5 pesanan baru masuk berhasil di-fetch.' },
  { id: 'LOG-8803', time: '10:30 AM, 12 Oct', type: 'Stock', platform: 'TikTok Shop', shop: 'StyleStudio Shop', status: 'Failed', success: 0, failed: 12, duration: '8s', logMessage: 'Token akses kadaluarsa. Silakan lakukan re-autentikasi.' },
  { id: 'LOG-8804', time: '10:15 AM, 12 Oct', type: 'Price', platform: 'Lazada', shop: 'Bizora Official Store', status: 'Success', success: 128, failed: 0, duration: '6s', logMessage: 'Update harga promo Merdeka berhasil.' },
  { id: 'LOG-8805', time: '09:50 AM, 12 Oct', type: 'Stock', platform: 'Shopee', shop: 'TechZone ID Shopee', status: 'Partial', success: 40, failed: 2, duration: '5s', logMessage: '2 SKU gagal update karena stok di Shopee sedang dikunci promo.' },
  { id: 'LOG-8806', time: '09:10 AM, 12 Oct', type: 'Products', platform: 'Tokopedia', shop: 'TechZone ID Tokopedia', status: 'Success', success: 95, failed: 0, duration: '7s', logMessage: 'Sync katalog master berhasil.' },
  { id: 'LOG-8807', time: '08:30 AM, 12 Oct', type: 'Orders', platform: 'TikTok Shop', shop: 'StyleStudio Shop', status: 'Success', success: 18, failed: 0, duration: '3s', logMessage: 'Sync pesanan live streaming selesai.' },
];

export const SyncHistoryView: React.FC = () => {
  const { user } = useAuth();
  const DEMO_EMAILS = ['seller@demo.com', 'ahmad@retail.com', 'retail@demo.com', 'siti@ikan.com', 'budidaya@demo.com', 'dewi@kuliner.com', 'kuliner@demo.com', 'jasa@demo.com'];
  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-') || DEMO_EMAILS.includes(user?.email || '');

  const [logs] = useState<SyncLogItem[]>(isDemo ? INITIAL_SYNC_LOGS : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState<SyncLogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportLog = () => {
    showToast('Log sinkronisasi berhasil diexport ke format CSV/Excel.');
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.platform.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = selectedModule === 'all' || l.type.toLowerCase() === selectedModule.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || l.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [logs, searchTerm, selectedModule, selectedStatus]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setCurrentPage,
  } = usePagination(filteredLogs);

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
            <History className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="truncate">Sync History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Riwayat lengkap sinkronisasi data antar platform.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={handleExportLog}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors text-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, platform, atau tipe sync..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Modul Sync</option>
              <option value="products">Produk</option>
              <option value="stock">Stok</option>
              <option value="price">Harga</option>
              <option value="orders">Pesanan</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="success">Success</option>
              <option value="partial">Partial Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">LOG ID & TANGGAL</th>
                <th className="py-3 px-4">MODUL</th>
                <th className="py-3 px-4">PLATFORM & TOKO</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center">SUCCESS</th>
                <th className="py-3 px-4 text-center">FAILED</th>
                <th className="py-3 px-4 text-center">DURASI</th>
                <th className="py-3 px-4 text-right">DETAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Tidak ada riwayat sync ditemukan
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{row.id}</p>
                      <p className="text-[11px] text-slate-400">{row.time}</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {row.type}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{row.shop}</p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400">{row.platform}</p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {row.status === 'Success' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      ) : row.status === 'Partial' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
                          <AlertCircle className="w-3 h-3" />
                          Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{row.success}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 dark:text-rose-400">{row.failed}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">{row.duration}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLogDetail(row)}
                        className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-semibold cursor-pointer"
                      >
                        Lihat Log
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

      {/* Log Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Detail Log Sinkronisasi ({selectedLogDetail.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Toko / Platform:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedLogDetail.shop} ({selectedLogDetail.platform})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Waktu Exec:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedLogDetail.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Hasil:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedLogDetail.success} Sukses, {selectedLogDetail.failed} Gagal</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Pesan Sistem / Error Output:</span>
                <pre className="p-3 bg-slate-900 text-amber-400 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap">
                  {selectedLogDetail.logMessage}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
