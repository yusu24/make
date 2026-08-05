import React, { useState, useMemo } from 'react';
import { Box, Search, Download, CheckCircle2, AlertCircle, Truck, MapPin, Calendar, Clock, X } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface ShipmentItem {
  id: string;
  orderId: string;
  buyer: string;
  courier: string;
  awb: string;
  schedule: string;
  status: string;
  color: string;
  bg: string;
}

const INITIAL_SHIPMENTS: ShipmentItem[] = [
  { id: '1', orderId: 'INV-12003', buyer: 'Budi Santoso', courier: 'J&T Express', awb: 'JP1234567890', schedule: 'Hari ini, 14:00', status: 'Ready Pickup', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { id: '2', orderId: 'INV-12004', buyer: 'Siti Aminah', courier: 'JNE Reguler', awb: '01234567891234', schedule: 'Hari ini, 15:00', status: 'Sedang Dikirim', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: '3', orderId: 'INV-12005', buyer: 'Ahmad Dahlan', courier: 'SiCepat Halu', awb: '001234567890', schedule: 'Kemarin', status: 'Terkirim', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: '4', orderId: 'INV-12006', buyer: 'Dewi Sartika', courier: 'GoSend Instant', awb: 'GOSEND-998822', schedule: 'Hari ini, 10:00', status: 'Terkirim', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: '5', orderId: 'INV-12007', buyer: 'Rizky Febian', courier: 'Ninja Xpress', awb: 'NJX-88771122', schedule: 'Kemarin', status: 'Retur', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  { id: '6', orderId: 'INV-12008', buyer: 'Hendra Setiawan', courier: 'J&T Express', awb: 'JP9988112233', schedule: 'Hari ini, 16:30', status: 'Ready Pickup', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { id: '7', orderId: 'INV-12009', buyer: 'Clarissa Putri', courier: 'Anteraja Reg', awb: 'ANT-99001122', schedule: 'Hari ini, 17:00', status: 'Sedang Dikirim', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
];

export const ShippingManagementView: React.FC = () => {
  const [shipments] = useState<ShipmentItem[]>(INITIAL_SHIPMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTrackingItem, setSelectedTrackingItem] = useState<ShipmentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportResi = () => {
    showToast('Berhasil meng-export 145 data resi ke format Excel.');
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      const matchesSearch =
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourier =
        selectedCourier === 'all' || item.courier.toLowerCase().includes(selectedCourier.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'pickup' && item.status === 'Ready Pickup') ||
        (selectedStatus === 'shipping' && item.status === 'Sedang Dikirim') ||
        (selectedStatus === 'delivered' && item.status === 'Terkirim') ||
        (selectedStatus === 'returned' && item.status === 'Retur');

      return matchesSearch && matchesCourier && matchesStatus;
    });
  }, [shipments, searchTerm, selectedCourier, selectedStatus]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setCurrentPage,
  } = usePagination(filteredShipments);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Box className="w-5 h-5 text-orange-600 shrink-0" />
            <span className="truncate">Manajemen Ekspedisi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Atur kurir, jadwal pickup, dan lacak status pengiriman.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={handleExportResi}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors text-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-500" />
            <span>Export Resi Massal</span>
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no. resi, order ID, atau nama pembeli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Ekspedisi/Kurir</option>
              <option value="jnt">J&T Express</option>
              <option value="jne">JNE</option>
              <option value="sicepat">SiCepat</option>
              <option value="gosend">GoSend</option>
              <option value="ninja">Ninja Xpress</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status Pengiriman</option>
              <option value="pickup">Ready Pickup</option>
              <option value="shipping">Sedang Dikirim</option>
              <option value="delivered">Terkirim</option>
              <option value="returned">Retur</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">ORDER ID & PEMBELI</th>
                <th className="py-3 px-4">EKSPEDISI</th>
                <th className="py-3 px-4">NO. RESI (AWB)</th>
                <th className="py-3 px-4">JADWAL PICKUP</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Tidak ada pengiriman ditemukan
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{row.orderId}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{row.buyer}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{row.courier}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300 font-bold">{row.awb}</td>
                    <td className="py-3.5 px-4 text-slate-500">{row.schedule}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${row.bg} ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTrackingItem(row)}
                        className="text-orange-600 dark:text-orange-400 hover:underline text-xs font-semibold cursor-pointer"
                      >
                        Lacak Paket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Standardized Pagination matching CatalogView */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Lacak Paket Modal */}
      {selectedTrackingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pelacakan Paket ({selectedTrackingItem.orderId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrackingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ekspedisi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTrackingItem.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Resi / AWB:</span>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{selectedTrackingItem.awb}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penerima:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedTrackingItem.buyer}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3 pl-2 border-l-2 border-orange-500/30 text-xs">
              <div className="relative pl-4">
                <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-800" />
                <p className="font-bold text-slate-800 dark:text-slate-100">Paket Diterima Oleh Pembeli</p>
                <p className="text-[11px] text-slate-400">12 Oct 2026, 14:20 • Kurir (J&T)</p>
              </div>
              <div className="relative pl-4">
                <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-800" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Kurir Sedang Menuju Alamat Penerima</p>
                <p className="text-[11px] text-slate-400">12 Oct 2026, 09:10 • Hub Jakarta Selatan</p>
              </div>
              <div className="relative pl-4">
                <div className="absolute -left-[17px] top-0 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-800" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Paket Telah Di-pickup dari Gudang Seller</p>
                <p className="text-[11px] text-slate-400">11 Oct 2026, 16:00 • Bizora Warehouse</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTrackingItem(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
