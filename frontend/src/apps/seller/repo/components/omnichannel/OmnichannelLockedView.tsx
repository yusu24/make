import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Globe,
  RefreshCw,
  ClipboardCheck,
  ShieldCheck,
  LayoutDashboard
} from '@/constants/icons';

interface OmnichannelLockedViewProps {
  title?: string;
  description?: string;
}

export const OmnichannelLockedView: React.FC<OmnichannelLockedViewProps> = ({
  title = 'Fitur Marketplace & Omnichannel',
  description = 'Fitur ini merupakan bagian dari paket ekstra Omnichannel untuk menghubungkan kasir toko fisik Anda ke marketplace (Shopee, Tokopedia, TikTok Shop, Lazada).'
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        {/* Glow Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-sky-500 flex items-center justify-center mx-auto border border-sky-500/30 shadow-inner">
          <Lock className="w-8 h-8 text-sky-500 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Paket Ekstra Diperlukan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-3 gap-3.5 text-left pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Multi-Marketplace
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Integrasi Shopee, Tokopedia, TikTok Shop &amp; Lazada dari satu layar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Auto-Sync Stok
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Stok kasir toko offline dan online sinkron otomatis tanpa risiko overselling.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Resi AWB Thermal
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Packing station cepat &amp; cetak label kurir barcode dengan printer thermal.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/seller/subscription')}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buka Paket Omnichannel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OmnichannelLockedView;
