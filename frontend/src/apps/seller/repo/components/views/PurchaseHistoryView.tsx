import React, { useEffect, useState } from 'react';
import { Truck, Plus, Trash2, Package, Eye, X } from 'lucide-react';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { AddPurchaseModal } from '../modals/AddPurchaseModal';
import { formatIDR } from '../../utils/formatters';

interface PurchaseItemRow {
  id: number;
  product_id: number;
  qty: string | number;
  cost_per_item: string | number;
  subtotal: string | number;
  product?: { id: number; name: string; sku: string } | null;
}

interface PurchaseRow {
  id: number;
  purchase_date: string;
  total_cost: string | number;
  notes: string | null;
  supplier?: { id: number; name: string } | null;
  items: PurchaseItemRow[];
}

export const PurchaseHistoryView: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailPurchase, setDetailPurchase] = useState<PurchaseRow | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/retail/purchases')
      .then((res) => setPurchases(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const { paginatedItems: paginatedPurchases, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(purchases);

  const handleCancel = async (purchase: PurchaseRow) => {
    if (!confirm(`Batalkan penerimaan barang tanggal ${purchase.purchase_date}? Stok yang sudah masuk akan dikurangi kembali.`)) return;
    try {
      await api.delete(`/retail/purchases/${purchase.id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membatalkan penerimaan barang.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Penerimaan Barang dari Supplier</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Riwayat barang masuk ke gudang beserta biaya belinya. Setiap penerimaan otomatis menambah stok & tercatat di riwayat mutasi.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Catat Penerimaan Baru</span>
          <span className="sm:hidden">Catat Baru</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Supplier</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Total Biaya</th>
                <th className="px-4 py-3 font-semibold">Catatan</th>
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Belum ada riwayat penerimaan barang</span>
                      <span className="text-[11px]">Klik "Catat Penerimaan Baru" untuk mencatat barang masuk dari supplier.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors align-top">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{p.purchase_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.supplier?.name || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {formatIDR(Number(p.total_cost))}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDetailPurchase(p)}
                        title="Lihat Detail Barang"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(p)}
                        title="Batalkan Penerimaan"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && purchases.length > 0 && (
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

      <AddPurchaseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={fetchData}
      />

      {detailPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Detail Barang Diterima
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {detailPurchase.purchase_date} · {detailPurchase.supplier?.name || 'Tanpa Supplier'}
                </p>
              </div>
              <button onClick={() => setDetailPurchase(null)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto text-xs">
              <div className="space-y-2">
                {detailPurchase.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{it.product?.name || `#${it.product_id}`}</div>
                      <div className="text-[11px] text-slate-400">
                        {it.qty} x {formatIDR(Number(it.cost_per_item))}
                      </div>
                    </div>
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatIDR(Number(it.subtotal))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl font-semibold text-slate-800 dark:text-slate-100">
                <span>Total Biaya</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">
                  {formatIDR(Number(detailPurchase.total_cost))}
                </span>
              </div>

              {detailPurchase.notes && (
                <p className="mt-3 text-slate-500">Catatan: {detailPurchase.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
