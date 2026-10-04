import React, { useState } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw
} from '@/constants/icons';

export default function RetailImportModal({
  isOpen,
  onClose,
  title = 'Import Data Excel',
  entityName = 'Data',
  templateEndpoint, // e.g. '/retail/categories/template'
  importEndpoint,   // e.g. '/retail/categories/import'
  onSuccess,
  sampleFields = [],
}) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = async (format = 'xlsx') => {
    setDownloading(true);
    try {
      const res = await api.get(templateEndpoint, {
        params: { format },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template_import_${entityName.toLowerCase()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Template ${format.toUpperCase()} berhasil diunduh`);
    } catch (e) {
      toast.error('Gagal mengunduh template');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Silakan pilih file Excel (.xlsx) atau CSV terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post(importEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data?.message || `Import ${entityName} berhasil!`);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Gagal mengimpor ${entityName}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="text-[11px] text-slate-400">Upload spreadsheet Excel / CSV untuk migrasi data cepat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Step 1: Download Template */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Langkah 1</span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  Unduh Format Template
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Gunakan format kolom yang sudah disediakan agar data {entityName.toLowerCase()} terbaca otomatis tanpa error.
                </p>
                {sampleFields.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sampleFields.map((f, i) => (
                      <span key={i} className="text-[9.5px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                disabled={downloading}
                onClick={() => handleDownloadTemplate('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
              >
                <Download size={13} />
                Download Excel (.xlsx)
              </button>
              <button
                type="button"
                disabled={downloading}
                onClick={() => handleDownloadTemplate('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <Download size={13} />
                Download CSV
              </button>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Langkah 2</span>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 mb-2">
                Pilih File yang Sudah Diisi
              </h4>
              <label
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  file
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Upload size={18} />
                  </div>
                  {file ? (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB — Siap diimpor</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Klik untuk memilih file</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mendukung format .XLSX, .XLS, atau .CSV (Maks. 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                {loading && <RefreshCw size={14} className="animate-spin" />}
                {loading ? 'Mengimpor Data...' : `Mulai Import ${entityName}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
