import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  CheckCircle2,
  Globe,
  RefreshCw,
  ClipboardCheck,
  Warehouse,
  ArrowRight,
  ShieldCheck,
  Zap
} from '@/constants/icons';

interface OmnichannelUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const OmnichannelUpgradeModal: React.FC<OmnichannelUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName = 'Integrasi Marketplace & Omnichannel'
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/seller/subscription');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Glow Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Paket Ekstra Omnichannel</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              Buka Akses {featureName}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Toko Anda saat ini menggunakan paket <strong>Retail Toko Fisik (POS)</strong>. Tingkatkan ke <strong>Paket Pro Omnichannel</strong> untuk menghubungkan kasir toko ke marketplace online.
            </p>
          </div>

          {/* Marketplace Badges */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Didukung:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold">
                Shopee
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                Tokopedia
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                TikTok Shop
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                Lazada
              </span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5 border border-sky-100 dark:border-sky-900">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Sinkronisasi Stok Otomatis Real-Time
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Barang terjual di kasir toko fisik langsung memotong stok di Shopee & TikTok secara instan tanpa selisih.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 border border-purple-100 dark:border-purple-900">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Station Packing & Cetak Resi AWB Thermal
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scan barcode paket, otomatis cetak label resi kurir (SPX, J&T, SiCepat, JNE) ukuran thermal 100x150mm.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 border border-indigo-100 dark:border-indigo-900">
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Manajemen Multi-Gudang Online & Cabang
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pisahkan alokasi stok untuk toko offline dan gudang fulfillment online secara akurat.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 dark:from-sky-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-sky-100 dark:border-sky-900/60 rounded-2xl flex items-center justify-between">
            <div className="text-left">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Termasuk di Paket</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Pro Omnichannel</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-sky-600 dark:text-sky-400">Rp 149.000 <span className="text-[11px] font-normal text-slate-500">/bulan</span></p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3 h-3" /> Termasuk semua fitur
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Upgrade Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmnichannelUpgradeModal;
