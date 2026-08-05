import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { downloadProductImportTemplate } from '../../utils/excelExport';
import { Product } from '../../types';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newProducts: any[]) => void;
}

export const ImportProductsModal: React.FC<ImportProductsModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) {
          setErrorMsg('File kosong atau tidak dapat dibaca.');
          setLoading(false);
          return;
        }

        // Parse CSV lines
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setErrorMsg('File hanya memiliki header atau tidak ada baris data.');
          setLoading(false);
          return;
        }

        const parseCsvRow = (rowStr: string) => {
          const result: string[] = [];
          let insideQuotes = false;
          let currentStr = '';

          for (let i = 0; i < rowStr.length; i++) {
            const char = rowStr[i];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              result.push(currentStr.trim().replace(/^"|"$/g, ''));
              currentStr = '';
            } else {
              currentStr += char;
            }
          }
          result.push(currentStr.trim().replace(/^"|"$/g, ''));
          return result;
        };

        const headerRow = parseCsvRow(lines[0]);
        // Map data rows
        const items: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvRow(lines[i]);
          if (cols.length < 2) continue;

          // Expected: SKU, Nama_Produk, Kategori, Harga_Beli_HPP, Harga_Jual, Stok_Awal, Satuan
          const sku = cols[0] || `SKU-IMP-${Date.now()}-${i}`;
          const name = cols[1] || `Produk Import ${i}`;
          const category = cols[2] || 'Umum';
          const costPrice = parseFloat(cols[3]) || 0;
          const price = parseFloat(cols[4]) || 0;
          const totalStock = parseInt(cols[5]) || 0;
          const unit = cols[6] || 'Pcs';

          items.push({
            id: `imp-${Date.now()}-${i}`,
            sku,
            name,
            category,
            costPrice,
            price,
            shopeePrice: price,
            tokopediaPrice: price,
            tiktokPrice: price,
            totalStock,
            unit,
            status: totalStock <= 0 ? 'Habis' : totalStock <= 5 ? 'Stok Menipis' : 'Aktif',
            syncStatus: 'Tersinkron',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
          });
        }

        if (items.length === 0) {
          setErrorMsg('Tidak dapat membaca data baris produk dari file CSV.');
        } else {
          setParsedData(items);
        }
      } catch (err: any) {
        setErrorMsg('Gagal memproses file. Pastikan format file sesuai dengan template CSV.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleSubmitImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData);
    onClose();
  };

  const handleReset = () => {
    setFileName(null);
    setParsedData([]);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Import Data Produk Master (Excel / CSV)
              </h3>
              <p className="text-[11px] text-slate-500">
                Unggah file Excel/CSV untuk onboarding awal katalog produk toko Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Step 1: Download Template */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-emerald-900 dark:text-emerald-200 block text-xs">
                📥 Step 1: Download Template Acuan Import
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Gunakan template standar agar nama kolom (SKU, Nama, Harga, Stok) terisi secara presisi.
              </p>
            </div>
            <button
              onClick={downloadProductImportTemplate}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Template CSV</span>
            </button>
          </div>

          {/* Step 2: Upload Zone */}
          {!parsedData.length && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/30 transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept=".csv, .txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                Klik atau Tarik File CSV / Excel ke sini
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Format yang didukung: .csv (Comma / UTF-8 Separated)
              </span>
            </div>
          )}

          {/* Error alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 3: Parsed Data Preview */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Berhasil membaca {parsedData.length} baris produk dari file "{fileName}"</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 underline"
                >
                  <RefreshCw className="w-3 h-3" /> Ganti File
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2 border-b">SKU</th>
                      <th className="p-2 border-b">Nama Produk</th>
                      <th className="p-2 border-b">Kategori</th>
                      <th className="p-2 border-b text-right">HPP Modal</th>
                      <th className="p-2 border-b text-right">Harga Jual</th>
                      <th className="p-2 border-b text-center">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 bg-white dark:bg-slate-900">
                    {parsedData.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-mono font-semibold text-slate-800 dark:text-slate-200">{item.sku}</td>
                        <td className="p-2 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                        <td className="p-2 text-slate-500">{item.category}</td>
                        <td className="p-2 text-right font-mono text-slate-600 dark:text-slate-400">Rp {item.costPrice?.toLocaleString('id-ID')}</td>
                        <td className="p-2 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400">Rp {item.price?.toLocaleString('id-ID')}</td>
                        <td className="p-2 text-center font-bold text-slate-800 dark:text-slate-200">{item.totalStock} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="p-2 text-center bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px]">
                    ... dan {parsedData.length - 10} produk lainnya
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmitImport}
            disabled={parsedData.length === 0}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proses Import ({parsedData.length} Produk)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
