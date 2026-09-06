import React, { createContext, useCallback, useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, HelpCircle, CheckCircle2, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState(null); // { title, message, resolve, danger, icon, confirmLabel, cancelLabel }

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({
        title: options.title || (options.danger !== false ? 'Konfirmasi Tindakan' : 'Perhatian'),
        message,
        confirmLabel: options.confirmLabel || (options.danger !== false ? 'Ya, Lanjutkan' : 'Konfirmasi'),
        cancelLabel: options.cancelLabel || 'Batal',
        danger: options.danger ?? true,
        icon: options.icon || (options.danger !== false ? 'danger' : 'info'),
        resolve,
      });
    });
  }, []);

  const close = (result) => {
    if (state?.resolve) {
      state.resolve(result);
    }
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => close(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 overflow-hidden transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => close(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl shrink-0 ${
                state.danger
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
              }`}>
                {state.danger ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pr-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {state.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {state.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all cursor-pointer ${
                  state.danger
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 active:scale-95'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  return ctx;
}
