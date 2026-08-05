import React from 'react';
import { X, Printer, Package, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { getPlatformBadgeColor, formatIDR } from '../../utils/formatters';

interface AwbPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const AwbPrintModal: React.FC<AwbPrintModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const badge = getPlatformBadgeColor(order.platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Cetak Label Resi Thermal AWB ({order.platform})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Label Thermal</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Label Preview */}
        <div className="p-6 bg-slate-100 dark:bg-slate-900 flex justify-center">
          <div className="w-[320px] bg-white text-black p-4 rounded border-2 border-dashed border-slate-300 font-mono text-[11px] shadow-md">
            {/* Courier Header */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-2">
              <span className="font-extrabold text-base tracking-wider uppercase">
                {order.courier}
              </span>
              <span className="text-[10px] font-semibold border border-black px-1.5 py-0.5">
                NON-COD
              </span>
            </div>

            {/* Tracking Barcode Representation */}
            <div className="text-center py-2 bg-slate-100 my-2 rounded">
              <div className="h-10 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)] w-full mb-1" />
              <span className="font-semibold text-xs tracking-widest">{order.trackingNumber || 'JX9821039821'}</span>
            </div>

            {/* Order info */}
            <div className="border-t border-b border-black py-2 my-2 space-y-1 text-[10px]">
              <div>
                <span className="font-semibold">No. Pesanan: </span>
                <span>{order.orderNumber}</span>
              </div>
              <div>
                <span className="font-semibold">Toko: </span>
                <span>{order.storeName} ({order.platform})</span>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="py-1">
              <span className="font-semibold block uppercase text-[9px] text-slate-500">PENERIMA:</span>
              <p className="font-semibold">{order.customerName} ({order.customerPhone})</p>
              <p className="text-[10px] leading-tight text-slate-700 mt-0.5">{order.address}</p>
            </div>

            {/* Items table */}
            <div className="border-t border-black pt-2 mt-2">
              <span className="font-semibold block uppercase text-[9px] text-slate-500 mb-1">DAFTAR BARANG:</span>
              <ul className="space-y-1 text-[10px]">
                {order.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate max-w-[200px]">{it.quantity}x {it.productName}</span>
                    <span className="font-semibold">{it.variant}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
