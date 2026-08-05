import React, { useEffect, useState } from 'react';
import { ClipboardCheck, CheckCircle2, Eye, X, Package } from 'lucide-react';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface OpnameRow {
  id: number;
  status: 'draft' | 'finalized';
  note: string | null;
  created_at: string;
  finalized_at: string | null;
  user?: { id: number; name: string } | null;
}

interface OpnameItem {
  id: number;
  product_id: number;
  system_qty: string | number;
  physical_qty: string | number;
  difference: string | number;
  product?: { id: number; name: string; sku: string } | null;
}

interface OpnameDetail extends OpnameRow {
  items: OpnameItem[];
}

export const StockOpnameView: React.FC = () => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [opnames, setOpnames] = useState<OpnameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<OpnameDetail | null>(null);
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    api.get('/retail/stock-opnames')
      .then((res) => setOpnames(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOpnames([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const { paginatedItems: paginatedOpnames, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(opnames);

  const startOpname = async () => {
    setStarting(true);
    try {
      const res = await api.post('/retail/stock-opnames', { note: '' });
      fetchData();
      await openDetail(res.data.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memulai stock opname. Pastikan tidak ada opname draft lain yang masih berjalan.');
    } finally {
      setStarting(false);
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`/retail/stock-opnames/${id}`);
      setDetail(res.data);
      const c: Record<number, string> = {};
      res.data.items.forEach((it: OpnameItem) => { c[it.product_id] = String(it.physical_qty); });
      setCounts(c);
    } catch {
      alert('Gagal memuat detail stock opname.');
    }
  };

  const saveCounts = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const items = Object.entries(counts).map(([product_id, physical_qty]) => ({
        product_id: Number(product_id),
        physical_qty: Number(physical_qty) || 0,
      }));
      const res = await api.put(`/retail/stock-opnames/${detail.id}`, { items });
      setDetail(res.data);
    } catch {
      alert('Gagal menyimpan hasil hitung.');
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    if (!detail) return;
    if (!confirm('Finalisasi stock opname? Stok sistem akan disesuaikan dengan hasil hitung fisik dan tidak bisa diubah lagi.')) return;
    try {
      const items = Object.entries(counts).map(([product_id, physical_qty]) => ({
        product_id: Number(product_id),
        physical_qty: Number(physical_qty) || 0,
      }));
      await api.put(`/retail/stock-opnames/${detail.id}`, { items });
      const res = await api.post(`/retail/stock-opnames/${detail.id}/finalize`);
      setDetail(res.data);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal finalisasi stock opname.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">{i18n?.language === 'en' ? 'Stock Count (Physical Audit Opname)' : 'Stock Opname (Hitung Fisik Gudang)'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            {i18n?.language === 'en' ? 'Reconcile system stock with physical count. System stock automatically adjusts on finalization.' : 'Cocokkan stok sistem dengan hasil hitung fisik. Saat difinalisasi, stok sistem otomatis disesuaikan.'}
          </p>
        </div>
        <button
          onClick={startOpname}
          disabled={starting}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>{starting ? (i18n?.language === 'en' ? 'Starting...' : 'Memulai...') : (i18n?.language === 'en' ? 'Start Stock Opname' : 'Mulai Stock Opname')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal Mulai</th>
                <th className="px-4 py-3 font-semibold">Petugas</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : opnames.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Belum ada stock opname</span>
                      <span className="text-[11px]">Klik "Mulai Stock Opname" untuk memulai hitung fisik gudang.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOpnames.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{new Date(o.created_at).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{o.user?.name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        o.status === 'finalized'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {o.status === 'finalized' ? 'Selesai' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openDetail(o.id)} title="Lihat Detail" className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && opnames.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                Stock Opname #{detail.id}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  detail.status === 'finalized'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {detail.status === 'finalized' ? 'Selesai' : 'Draft'}
                </span>
              </h3>
              <button onClick={() => setDetail(null)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3 text-center">Stok Sistem</th>
                      <th className="py-2.5 px-3 text-center">Hitung Fisik</th>
                      <th className="py-2.5 px-3 text-center">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {detail.items.map((item) => {
                      const physicalVal = counts[item.product_id] ?? String(item.physical_qty);
                      const diff = (Number(physicalVal) || 0) - Number(item.system_qty);
                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">{item.product?.name || `#${item.product_id}`}</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{item.system_qty}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              disabled={detail.status === 'finalized'}
                              value={physicalVal}
                              onChange={(e) => setCounts((prev) => ({ ...prev, [item.product_id]: e.target.value }))}
                              className="w-20 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-semibold disabled:opacity-60"
                            />
                          </td>
                          <td className={`py-2.5 px-3 text-center font-semibold ${diff !== 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {detail.status !== 'finalized' && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 shrink-0 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={saveCounts}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Hitungan'}
                </button>
                <button
                  type="button"
                  onClick={finalize}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finalisasi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
