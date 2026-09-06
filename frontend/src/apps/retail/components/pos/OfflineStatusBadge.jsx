import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function OfflineStatusBadge({
  isOnline,
  isSyncing,
  pendingCount = 0,
  pendingTransactions = [],
  onSyncNow
}) {
  const [showQueueModal, setShowQueueModal] = useState(false);

  return (
    <>
      {/* Badge Button */}
      <div className="flex items-center">
        {isSyncing ? (
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer shadow-2xs hover:bg-blue-100 transition-colors"
            title="Sedang menyinkronkan transaksi ke cloud..."
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span className="hidden sm:inline">Menyinkronkan...</span>
            <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">{pendingCount}</span>
          </button>
        ) : !isOnline ? (
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 cursor-pointer shadow-2xs animate-pulse hover:bg-amber-100 transition-colors"
            title="Mode Offline Aktif: Transaksi disimpan di memori lokal"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Offline</span>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ) : pendingCount > 0 ? (
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 cursor-pointer shadow-2xs hover:bg-orange-100 transition-colors"
            title="Ada transaksi tertunda yang siap disinkronkan"
          >
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Antrean ({pendingCount})</span>
            <span className="bg-orange-600 text-white text-[10px] px-1.5 rounded-full">{pendingCount}</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default shadow-2xs"
            title="Terhubung ke Cloud Server"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Wifi className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline font-bold">Online</span>
          </div>
        )}
      </div>

      {/* Offline Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${!isOnline ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {!isOnline ? <WifiOff size={16} /> : <RefreshCw size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Antrean Transaksi Offline</h3>
                  <p className="text-[11px] text-slate-400">
                    {!isOnline ? 'Koneksi internet terputus' : 'Siap disinkronkan ke server cloud'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pendingTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                  <p className="text-xs font-bold text-slate-700">Semua Transaksi Tersinkronisasi</p>
                  <p className="text-[11px] text-slate-400">Tidak ada antrean transaksi offline yang tertunda.</p>
                </div>
              ) : (
                pendingTransactions.map((tx) => (
                  <div
                    key={tx.offline_id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-600">{tx.invoice_no}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                        {tx.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span className="font-bold text-slate-800">{fmtRp(tx.payload?.total || tx.receipt_data?.total)}</span>
                    </div>

                    {tx.error_message && (
                      <p className="text-[10px] text-rose-600 font-medium bg-rose-50 p-1.5 rounded-lg">
                        Gagal: {tx.error_message}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Total Tertunda: <strong className="text-slate-800">{pendingCount}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQueueModal(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  disabled={isSyncing || pendingCount === 0 || !isOnline}
                  onClick={() => {
                    if (onSyncNow) onSyncNow();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Sinkronkan Sekarang</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
