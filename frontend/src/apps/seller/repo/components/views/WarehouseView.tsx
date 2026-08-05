import React from 'react';
import { Warehouse as WarehouseIcon, MapPin, User, Phone, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { Warehouse, StockMovement } from '../../types';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { exportToCsv } from '../../utils/excelExport';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface WarehouseViewProps {
  warehouses: Warehouse[];
  stockMovements: StockMovement[];
  onAddWarehouse?: () => void;
  onEditWarehouse?: (warehouse: Warehouse) => void;
  onDeleteWarehouse?: (id: string) => void;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({ warehouses, stockMovements, onAddWarehouse, onEditWarehouse, onDeleteWarehouse }) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const { paginatedItems: paginatedMovements, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(stockMovements);

  const handleExportExcel = () => {
    const headers = ['Tanggal', 'Produk', 'SKU', 'Tipe Mutasi', 'Jumlah (Qty)', 'Gudang Asal/Tujuan', 'Keterangan'];
    const rows = stockMovements.map((sm) => [
      sm.date,
      sm.productName,
      sm.sku,
      sm.type,
      sm.quantity,
      sm.warehouseName,
      sm.notes || '-',
    ]);
    exportToCsv('Riwayat_Mutasi_Stok_Gudang', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <WarehouseIcon className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">{t('seller.gudang')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            {t('seller.gudangSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Export Riwayat Mutasi ke Excel/CSV"
          >
            <Download className="w-4 h-4" />
            <span>{t('seller.exportExcel')}</span>
          </button>

          <button
            onClick={onAddWarehouse}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('seller.addWarehouse')}</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-xs whitespace-nowrap shrink-0">
                  {wh.code}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{wh.name}</h3>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" /> {wh.city}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {wh.isDefault && (
                  <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {i18n?.language === 'en' ? 'Main Warehouse' : 'Gudang Utama'}
                  </span>
                )}
                <button
                  onClick={() => onEditWarehouse?.(wh)}
                  title="Edit Gudang"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteWarehouse?.(wh.id)}
                  title="Hapus Gudang"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
              {wh.address}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{i18n?.language === 'en' ? 'TOTAL ITEMS' : 'TOTAL BARANG'}</span>
                <div className="text-base font-black text-slate-900 dark:text-slate-100">{wh.totalItems.toLocaleString()} unit</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{i18n?.language === 'en' ? 'PERSON IN CHARGE (PIC)' : 'PENANGGUNG JAWAB (PIC)'}</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{wh.picName}</div>
                <div className="text-[11px] text-slate-400">{wh.picPhone}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Movement Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {i18n?.language === 'en' ? 'Stock Movement & Audit History' : 'Riwayat Mutasi & Opname Stok'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'DATE / TIME' : 'WAKTU'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'PRODUCT & SKU' : 'PRODUK & SKU'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'MOVEMENT TYPE' : 'JENIS MUTASI'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'QUANTITY' : 'JUMLAH (QTY)'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'NOTES' : 'CATATAN'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{mov.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{mov.productName}</div>
                    <div className="text-[10px] text-slate-400">SKU: {mov.sku}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      mov.type === 'Masuk'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : mov.type === 'Keluar'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {mov.type === 'Masuk' ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3" />}
                      {mov.type === 'Masuk' ? (i18n?.language === 'en' ? 'Stock In' : 'Masuk') : mov.type === 'Keluar' ? (i18n?.language === 'en' ? 'Stock Out' : 'Keluar') : mov.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                    {mov.qty > 0 ? `+${mov.qty}` : mov.qty} unit
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{mov.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stockMovements.length > 0 && (
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
    </div>
  );
};
