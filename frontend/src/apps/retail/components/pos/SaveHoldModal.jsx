import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Check } from '@/constants/icons';

export default function SaveHoldModal({ isOpen, onClose, defaultName = '', onSave }) {
  const [refName, setRefName] = useState(defaultName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRefName(defaultName);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!refName.trim()) return;
    onSave(refName.trim());
  };

  return (
    <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Simpan Antrean / Bill</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Keterangan / Nama Pemesan
          </label>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all mb-4"
            placeholder="Contoh: Meja 4 / Bpk. Rudi"
            value={refName}
            onChange={(e) => setRefName(e.target.value)}
            required
          />

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Item belanjaan saat ini akan disimpan ke daftar antrean dan keranjang akan dikosongkan untuk melayani pelanggan berikutnya.
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={15} />
              Simpan ke Antrean
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
