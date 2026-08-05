import React from 'react';
import { Coins, ArrowDownRight, CreditCard, Building, RefreshCw, CheckCircle } from 'lucide-react';
import { CashSummaryItem } from '../../types';
import { formatIDR, getPlatformBadgeColor } from '../../utils/formatters';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface CashSummaryViewProps {
  cashSummaries: CashSummaryItem[];
}

export const CashSummaryView: React.FC<CashSummaryViewProps> = ({ cashSummaries }) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const totalReadyBalance = cashSummaries.reduce((sum, c) => sum + c.readyBalance, 0);
  const totalPendingEscrow = cashSummaries.reduce((sum, c) => sum + c.pendingEscrow, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md border border-indigo-700/50">
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
            {i18n?.language === 'en' ? 'TOTAL READY BALANCE' : 'TOTAL SALDO SIAP CAIR (READY BALANCE)'}
          </span>
          <div className="text-3xl font-black mt-2">{formatIDR(totalReadyBalance)}</div>
          <p className="text-xs text-indigo-100/80 mt-1">
            {i18n?.language === 'en' ? 'Ready for payout directly to primary BCA/Mandiri Bank Account.' : 'Siap ditarik langsung ke Rekening Bank Utama BCA/Mandiri.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-purple-700/50">
          <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            {i18n?.language === 'en' ? 'TOTAL ESCROW BALANCE' : 'TOTAL SALDO TERTAHAN (ESCROW MARKETPLACE)'}
          </span>
          <div className="text-3xl font-black mt-2">{formatIDR(totalPendingEscrow)}</div>
          <p className="text-xs text-purple-100/80 mt-1">
            {i18n?.language === 'en' ? 'Will be released automatically after buyer confirms order receipt.' : 'Akan cair otomatis setelah pembeli melakukan konfirmasi pesanan diterima.'}
          </p>
        </div>
      </div>

      {/* Cards per Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cashSummaries.map((cs) => {
          const badge = getPlatformBadgeColor(cs.platform);
          return (
            <div key={cs.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badge.bg} ${badge.text}`}>
                    {cs.platform}
                  </span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{cs.storeName}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Auto Settlement
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{i18n?.language === 'en' ? 'READY BALANCE' : 'SALDO SIAP TARIK'}</span>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{formatIDR(cs.readyBalance)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{i18n?.language === 'en' ? 'PENDING ESCROW' : 'PENDING ESCROW'}</span>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{formatIDR(cs.pendingEscrow)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium">{cs.bankAccount}</span>
                </div>
                <span className="font-semibold text-indigo-600">{cs.nextSettlementDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
